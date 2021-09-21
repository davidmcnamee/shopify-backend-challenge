
# Meme Marketplace

[Click here to try it out!](https://meme-marketplace.da.vidmcnam.ee)

**Backend developer challenge for Shopify internship application (Winter 2022) by David McNamee**

* [Intro](#intro)
* [User Guide / Screenshots](#user-guide--screenshots)
* [Technology Used](#technology-used)
* [Improvements / Todo](#improvements--todo)

## Intro

This is my personal take on the challenge to create an image repository. This is a web application that allows content creators to upload, share, and monetize their memes. Users who have created an account can upload memes to their page, and follow the pages of other users. If desired, users can become a premium follower by paying a one-time fee to the user who they'd like to follow, giving them access to privately posted memes from that user.

Users who are looking to build a following can set their price from the profile page. They can also set a price for individual memes, such that other users can purchase ownership of a popular meme (*image purchases are still a work-in-progress*).

Images are unique throughout the platform (using "blockhash" perceptual hashing libraries), and image files are only distributed with expiring s3 signed urls, incentivising fresh content rather than copied memes.

## User Guide / Screenshots

> TODO: screenshots

* Login/Register an account
* Upload an image (or more)
* View the images in your feed
* Search for an image by name or a user by username
* When logged out, you can only see other users' private images
* After becoming a premium follower, you can see that user's private images

## Technology Used

The app is generally divided into two core components: 

* the [`/frontend`](/frontend) static site that's built with Next.js, React and Shopify's Polaris UI library
* the [`/backend`](/backend) api server that's built with Typescript, Node.js, and Apollo Server (GraphQL)

Nearly all of the infrastructure has been provisioned using the Infrastructure as Code (IaC) principle, and is available in the [`/terraform`](/terraform) directory. *(Apologies that this isn't 100% reproducible, but the site is available online at the link above)*

Kubernetes is used for deployments, with yaml configuration in the [`/k8s`](/k8s) directory. I'm using skaffold to manage my development environment and deployments, so assuming the infrastructure is set up and environment secrets are accessible you can start the app with just `skaffold dev`.

### Infrastructure Used

Currently the provisioned infrastructure includes:
* A PostgreSQL13 database provisioned via Google Cloud SQL
* An S3 bucket which is used to store all the images for the site
* A Google Dataproc cluster for handling bulk image uploads using Apache Spark.
* Stripe Connect for accepting payments between two parties

I also have additional terraform configs [here](https://github.com/davidmcnamee/permanent-infra) to provision my kubernetes cluster, remote development environment, and route53 domain settings in case that piques your interest.

## Improvements / Todo

* While the bulk upload mutation works and tests pass (under `/backend/tests/images.test.ts`), there's still no page on the UI to access it.
* Tests are incomplete across many queries/mutations since there are a lot of them. Some of the core operations (upload image, login, register, etc.) are handled in `/backend/tests`, but not all of them.
* Pagination isn't working properly on the frontend, so users may see the new page of images "swap out" the existing page.
* Users can't buy ownership of images, so the prices on images are pointless at the moment.

