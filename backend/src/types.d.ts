export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Image = {
  __typename?: 'Image';
  forSale: Scalars['Boolean'];
  hash: Scalars['String'];
  id: Scalars['ID'];
  ownership: ImageOwnership;
  price?: Maybe<Price>;
  public: Scalars['Boolean'];
  url: Scalars['String'];
};

export type ImageMutations = {
  __typename?: 'ImageMutations';
  purchaseImage: Scalars['Boolean'];
  updateImage: Image;
  uploadImage: Image;
  uploadImages: Array<Image>;
  uploadImagesFromFile: Scalars['ID'];
};


export type ImageMutationsPurchaseImageArgs = {
  input: PurchaseImageInput;
};


export type ImageMutationsUpdateImageArgs = {
  input: UpdateImageInput;
};


export type ImageMutationsUploadImageArgs = {
  input: UploadImageInput;
};


export type ImageMutationsUploadImagesArgs = {
  input: Array<UploadImageInput>;
};


export type ImageMutationsUploadImagesFromFileArgs = {
  url: Scalars['String'];
};

export type ImageOwnership = {
  __typename?: 'ImageOwnership';
  owner: User;
  uploader: User;
};

export type LoginInput = {
  password: Scalars['String'];
  username: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  images: ImageMutations;
  users: UserMutations;
};

export type Object = Image | User;

export type Price = {
  __typename?: 'Price';
  amount: Scalars['Int'];
  currency: Scalars['String'];
  discount: Scalars['Int'];
};

export type PurchaseImageInput = {
  imageID: Scalars['ID'];
  price: Scalars['Int'];
};

export type Query = {
  __typename?: 'Query';
  get: Object;
  images: Array<Image>;
  search: Array<Image>;
};


export type QueryGetArgs = {
  id: Scalars['ID'];
};


export type QuerySearchArgs = {
  query?: Maybe<Scalars['String']>;
};

export type RegisterInput = {
  email: Scalars['String'];
  password: Scalars['String'];
  username: Scalars['String'];
};

export type SearchInput = {
  imageUrl?: Maybe<Scalars['String']>;
  textQuery?: Maybe<Scalars['String']>;
};

export type UpdateImageInput = {
  forSale?: Maybe<Scalars['Boolean']>;
  price?: Maybe<Price>;
  public?: Maybe<Scalars['Boolean']>;
};

export type UploadImageInput = {
  forSale: Scalars['Boolean'];
  price?: Maybe<Price>;
  public: Scalars['Boolean'];
  url: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String'];
  id: Scalars['ID'];
  inventory: Array<Image>;
  username: Scalars['String'];
};

export type UserMutations = {
  __typename?: 'UserMutations';
  login: User;
  register: User;
};


export type UserMutationsLoginArgs = {
  input: LoginInput;
};


export type UserMutationsRegisterArgs = {
  input: RegisterInput;
};
