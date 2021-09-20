"""
opens a given csv file of image urls, and performs all the
processessing necessary prior to the image's insertion into
the database.

Note: we currently don't insert into the sql database from this script,
  however this would be preferred (to reduce load on backend servers).
    ... but this would make the e2e tests more difficult to execute, since
    I would have to host the localhost database publically for Google Cloud
    dataproc to access – so I've opted not to do so.
"""
import hashlib
import json
import sys
from typing import Optional
from urllib.request import urlopen, urlretrieve
from uuid import uuid4

import boto3
import PIL.Image as Image
import pyspark
from blockhash.core import blockhash

accepted_filetypes = [".jpg", ".png", "jpeg"]

def get_file_hash(file_name: str) -> str:
    """
    since the "blockhash" perceptual hash only works on certain
    image file types, we must run a regular sha256 hash
    in the failure case
    """
    h = hashlib.sha256()
    with open(file_name,'rb') as f:
        h.update(f.read())
    return h.hexdigest()

def process_row(row: str) -> Optional[str]:
    """
    processes a row of the csv file by
    * validating the input
    * computing the image's hash
    * reuploading the image to our S3 bucket
    * returning SQL values to be inserted into our database
    """
    if not row.strip():
        return None
    fields = row.split(',')
    url = fields[0].split('?')[0]
    title = fields[1]
    public = len(fields) >= 3 and fields[2].upper() == "TRUE"
    price = int(fields[3]*100) if len(fields) >= 4 and fields[3] else None
    currency = fields[4] if len(fields) >= 5 and fields[4] else None
    discount = int(fields[5]*100) if len(fields) >= 6 and fields[5] else 0
    for_sale = len(fields) >= 7 and fields[6] == "TRUE"

    # check for invalid fields
    is_url_valid = any(url.endswith(ext) for ext in accepted_filetypes)
    if not is_url_valid:
        return None

    # download image file
    file_name = str(uuid4()) + "." + url.split('.')[-1]
    urlretrieve(url, file_name)
    im = Image.open(file_name)
    # compute perceptual (or file) hash
    if im.mode not in ('RGB', 'RGBA'):
        im_hash = get_file_hash(file_name)
    else:
        im_hash = blockhash(im)
    # reupload to s3
    s3_client = boto3.client('s3')
    s3_client.upload_file(file_name, 'shopifychallengeimages', file_name)
    # return a row for the "Image" table; to be passed back
    # to backend server and sanitized before insertion
    sql_vals = json.dumps([im_hash, url, price, currency, discount, for_sale, public, title])
    return sql_vals

def main(csv_url: str):
    sc = pyspark.SparkContext()
    with urlopen(csv_url) as response:
        lines = str(response.read().decode('utf-8')).split("\n")[1:]
    responses = sc.parallelize(lines).map(process_row).cache()

    result = (
        responses
            .filter(lambda x: isinstance(x, str))
            .reduce(lambda x, y: x + "," + y if (x and y) else (x or y))
    )
    assert result, "No valid rows were found"
    result = "[" + result + "]"
    print(f'SCRIPT RESULTS: {result}')

if __name__ == '__main__':
    csv_url = sys.argv[1]
    main(csv_url)
