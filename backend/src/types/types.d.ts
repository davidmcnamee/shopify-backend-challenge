import { GraphQLResolveInfo } from 'graphql';
import { CustomContextType } from './static';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type ResolverFn<TResult, TParent, TContext, TArgs> = (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => Promise<unknown> | unknown
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Error = {
  __typename?: 'Error';
  input: Scalars['String'];
  message: Scalars['String'];
};

export type Image = {
  __typename?: 'Image';
  forSale: Scalars['Boolean'];
  hash: Scalars['String'];
  id: Scalars['ID'];
  likedByMe: Scalars['Boolean'];
  likes: Scalars['Int'];
  ownership: ImageOwnership;
  price?: Maybe<Price>;
  public: Scalars['Boolean'];
  title?: Maybe<Scalars['String']>;
  url: Scalars['String'];
};

export type ImageMutations = {
  __typename?: 'ImageMutations';
  purchaseImage: Image;
  setLike?: Maybe<Image>;
  updateImage: Image;
  uploadImage: Image;
  uploadImages: Array<Image>;
  uploadImagesFromFile: Job;
};


export type ImageMutationsPurchaseImageArgs = {
  input: PurchaseImageInput;
};


export type ImageMutationsSetLikeArgs = {
  id: Scalars['ID'];
  like: Scalars['Boolean'];
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

export type ImageQuery = {
  ascending: Scalars['Boolean'];
  limit: Scalars['Int'];
  offset: Scalars['Int'];
  sort: SortField;
  userFilter?: Maybe<Scalars['ID']>;
};

export type Job = {
  __typename?: 'Job';
  creator: User;
  errorCount: Scalars['Int'];
  errors: Array<Error>;
  id: Scalars['ID'];
  status: JobStatus;
  successCount: Scalars['Int'];
  successfulUploads: Array<Image>;
};

export enum JobStatus {
  Completed = 'COMPLETED',
  Pending = 'PENDING',
  Running = 'RUNNING'
}

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

export type PriceInput = {
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
  imageUploadUrls: Array<UploadUrl>;
  images: Array<Image>;
  me?: Maybe<User>;
  search: Array<Object>;
};


export type QueryGetArgs = {
  id: Scalars['ID'];
};


export type QueryImageUploadUrlsArgs = {
  fileExtensions: Array<Scalars['String']>;
};


export type QueryImagesArgs = {
  query: ImageQuery;
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

export enum SortField {
  Likes = 'LIKES',
  Price = 'PRICE',
  UploadDate = 'UPLOAD_DATE'
}

export type UpdateImageInput = {
  forSale?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  price?: Maybe<PriceInput>;
  public?: Maybe<Scalars['Boolean']>;
  title?: Maybe<Scalars['String']>;
};

export type UploadImageInput = {
  forSale: Scalars['Boolean'];
  price?: Maybe<PriceInput>;
  public: Scalars['Boolean'];
  title?: Maybe<Scalars['String']>;
  url: Scalars['String'];
};

export type UploadUrl = {
  __typename?: 'UploadUrl';
  key: Scalars['String'];
  signedUrl: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  acceptingPayments: Scalars['Boolean'];
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



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Error: ResolverTypeWrapper<Error>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Image: ResolverTypeWrapper<Image>;
  ImageMutations: ResolverTypeWrapper<ImageMutations>;
  ImageOwnership: ResolverTypeWrapper<ImageOwnership>;
  ImageQuery: ImageQuery;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Job: ResolverTypeWrapper<Job>;
  JobStatus: JobStatus;
  LoginInput: LoginInput;
  Mutation: ResolverTypeWrapper<{}>;
  Object: ResolversTypes['Image'] | ResolversTypes['User'];
  Price: ResolverTypeWrapper<Price>;
  PriceInput: PriceInput;
  PurchaseImageInput: PurchaseImageInput;
  Query: ResolverTypeWrapper<{}>;
  RegisterInput: RegisterInput;
  SearchInput: SearchInput;
  SortField: SortField;
  String: ResolverTypeWrapper<Scalars['String']>;
  UpdateImageInput: UpdateImageInput;
  UploadImageInput: UploadImageInput;
  UploadUrl: ResolverTypeWrapper<UploadUrl>;
  User: ResolverTypeWrapper<User>;
  UserMutations: ResolverTypeWrapper<UserMutations>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean'];
  Error: Error;
  ID: Scalars['ID'];
  Image: Image;
  ImageMutations: ImageMutations;
  ImageOwnership: ImageOwnership;
  ImageQuery: ImageQuery;
  Int: Scalars['Int'];
  Job: Job;
  LoginInput: LoginInput;
  Mutation: {};
  Object: ResolversParentTypes['Image'] | ResolversParentTypes['User'];
  Price: Price;
  PriceInput: PriceInput;
  PurchaseImageInput: PurchaseImageInput;
  Query: {};
  RegisterInput: RegisterInput;
  SearchInput: SearchInput;
  String: Scalars['String'];
  UpdateImageInput: UpdateImageInput;
  UploadImageInput: UploadImageInput;
  UploadUrl: UploadUrl;
  User: User;
  UserMutations: UserMutations;
};

export type ErrorResolvers<ContextType = CustomContextType, ParentType = ResolversParentTypes['Error']> = {
  input?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ImageResolvers<ContextType = CustomContextType, ParentType = ResolversParentTypes['Image']> = {
  forSale?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hash?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  likedByMe?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  likes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ownership?: Resolver<ResolversTypes['ImageOwnership'], ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['Price']>, ParentType, ContextType>;
  public?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ImageMutationsResolvers<ContextType = CustomContextType, ParentType = ResolversParentTypes['ImageMutations']> = {
  purchaseImage?: Resolver<ResolversTypes['Image'], ParentType, ContextType, RequireFields<ImageMutationsPurchaseImageArgs, 'input'>>;
  setLike?: Resolver<Maybe<ResolversTypes['Image']>, ParentType, ContextType, RequireFields<ImageMutationsSetLikeArgs, 'id' | 'like'>>;
  updateImage?: Resolver<ResolversTypes['Image'], ParentType, ContextType, RequireFields<ImageMutationsUpdateImageArgs, 'input'>>;
  uploadImage?: Resolver<ResolversTypes['Image'], ParentType, ContextType, RequireFields<ImageMutationsUploadImageArgs, 'input'>>;
  uploadImages?: Resolver<Array<ResolversTypes['Image']>, ParentType, ContextType, RequireFields<ImageMutationsUploadImagesArgs, 'input'>>;
  uploadImagesFromFile?: Resolver<ResolversTypes['Job'], ParentType, ContextType, RequireFields<ImageMutationsUploadImagesFromFileArgs, 'url'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ImageOwnershipResolvers<ContextType = CustomContextType, ParentType = ResolversParentTypes['ImageOwnership']> = {
  owner?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  uploader?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type JobResolvers<ContextType = CustomContextType, ParentType = ResolversParentTypes['Job']> = {
  creator?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  errorCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  errors?: Resolver<Array<ResolversTypes['Error']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['JobStatus'], ParentType, ContextType>;
  successCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  successfulUploads?: Resolver<Array<ResolversTypes['Image']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = CustomContextType, ParentType = ResolversParentTypes['Mutation']> = {
  images?: Resolver<ResolversTypes['ImageMutations'], ParentType, ContextType>;
  users?: Resolver<ResolversTypes['UserMutations'], ParentType, ContextType>;
};

export type ObjectResolvers<ContextType = CustomContextType, ParentType = ResolversParentTypes['Object']> = {
  __resolveType: TypeResolveFn<'Image' | 'User', ParentType, ContextType>;
};

export type PriceResolvers<ContextType = CustomContextType, ParentType = ResolversParentTypes['Price']> = {
  amount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  discount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = CustomContextType, ParentType = ResolversParentTypes['Query']> = {
  get?: Resolver<ResolversTypes['Object'], ParentType, ContextType, RequireFields<QueryGetArgs, 'id'>>;
  imageUploadUrls?: Resolver<Array<ResolversTypes['UploadUrl']>, ParentType, ContextType, RequireFields<QueryImageUploadUrlsArgs, 'fileExtensions'>>;
  images?: Resolver<Array<ResolversTypes['Image']>, ParentType, ContextType, RequireFields<QueryImagesArgs, 'query'>>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  search?: Resolver<Array<ResolversTypes['Object']>, ParentType, ContextType, RequireFields<QuerySearchArgs, never>>;
};

export type UploadUrlResolvers<ContextType = CustomContextType, ParentType = ResolversParentTypes['UploadUrl']> = {
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  signedUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = CustomContextType, ParentType = ResolversParentTypes['User']> = {
  acceptingPayments?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  inventory?: Resolver<Array<ResolversTypes['Image']>, ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserMutationsResolvers<ContextType = CustomContextType, ParentType = ResolversParentTypes['UserMutations']> = {
  login?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<UserMutationsLoginArgs, 'input'>>;
  register?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<UserMutationsRegisterArgs, 'input'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = CustomContextType> = {
  Error?: ErrorResolvers<ContextType>;
  Image?: ImageResolvers<ContextType>;
  ImageMutations?: ImageMutationsResolvers<ContextType>;
  ImageOwnership?: ImageOwnershipResolvers<ContextType>;
  Job?: JobResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Object?: ObjectResolvers<ContextType>;
  Price?: PriceResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  UploadUrl?: UploadUrlResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserMutations?: UserMutationsResolvers<ContextType>;
};

