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

export type Image = {
  __typename?: 'Image';
  forSale: Scalars['Boolean'];
  hash: Scalars['String'];
  id: Scalars['ID'];
  ownership: ImageOwnership;
  price?: Maybe<Price>;
  public: Scalars['Boolean'];
  title?: Maybe<Scalars['String']>;
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
  id: Scalars['ID'];
  price?: Maybe<Price>;
  public?: Maybe<Scalars['Boolean']>;
  title?: Maybe<Scalars['String']>;
};

export type UploadImageInput = {
  forSale: Scalars['Boolean'];
  price?: Maybe<Price>;
  public: Scalars['Boolean'];
  title?: Maybe<Scalars['String']>;
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
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Image: ResolverTypeWrapper<Image>;
  ImageMutations: ResolverTypeWrapper<ImageMutations>;
  ImageOwnership: ResolverTypeWrapper<ImageOwnership>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  LoginInput: LoginInput;
  Mutation: ResolverTypeWrapper<{}>;
  Object: ResolversTypes['Image'] | ResolversTypes['User'];
  Price: ResolverTypeWrapper<Price>;
  PurchaseImageInput: PurchaseImageInput;
  Query: ResolverTypeWrapper<{}>;
  RegisterInput: RegisterInput;
  SearchInput: SearchInput;
  String: ResolverTypeWrapper<Scalars['String']>;
  UpdateImageInput: UpdateImageInput;
  UploadImageInput: UploadImageInput;
  User: ResolverTypeWrapper<User>;
  UserMutations: ResolverTypeWrapper<UserMutations>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean'];
  ID: Scalars['ID'];
  Image: Image;
  ImageMutations: ImageMutations;
  ImageOwnership: ImageOwnership;
  Int: Scalars['Int'];
  LoginInput: LoginInput;
  Mutation: {};
  Object: ResolversParentTypes['Image'] | ResolversParentTypes['User'];
  Price: Price;
  PurchaseImageInput: PurchaseImageInput;
  Query: {};
  RegisterInput: RegisterInput;
  SearchInput: SearchInput;
  String: Scalars['String'];
  UpdateImageInput: UpdateImageInput;
  UploadImageInput: UploadImageInput;
  User: User;
  UserMutations: UserMutations;
};

export type ImageResolvers<ContextType = CustomContextType, ParentType = ResolversParentTypes['Image']> = {
  forSale?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hash?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  ownership?: Resolver<ResolversTypes['ImageOwnership'], ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['Price']>, ParentType, ContextType>;
  public?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ImageMutationsResolvers<ContextType = CustomContextType, ParentType = ResolversParentTypes['ImageMutations']> = {
  purchaseImage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<ImageMutationsPurchaseImageArgs, 'input'>>;
  updateImage?: Resolver<ResolversTypes['Image'], ParentType, ContextType, RequireFields<ImageMutationsUpdateImageArgs, 'input'>>;
  uploadImage?: Resolver<ResolversTypes['Image'], ParentType, ContextType, RequireFields<ImageMutationsUploadImageArgs, 'input'>>;
  uploadImages?: Resolver<Array<ResolversTypes['Image']>, ParentType, ContextType, RequireFields<ImageMutationsUploadImagesArgs, 'input'>>;
  uploadImagesFromFile?: Resolver<ResolversTypes['ID'], ParentType, ContextType, RequireFields<ImageMutationsUploadImagesFromFileArgs, 'url'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ImageOwnershipResolvers<ContextType = CustomContextType, ParentType = ResolversParentTypes['ImageOwnership']> = {
  owner?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  uploader?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
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
  images?: Resolver<Array<ResolversTypes['Image']>, ParentType, ContextType>;
  search?: Resolver<Array<ResolversTypes['Image']>, ParentType, ContextType, RequireFields<QuerySearchArgs, never>>;
};

export type UserResolvers<ContextType = CustomContextType, ParentType = ResolversParentTypes['User']> = {
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
  Image?: ImageResolvers<ContextType>;
  ImageMutations?: ImageMutationsResolvers<ContextType>;
  ImageOwnership?: ImageOwnershipResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Object?: ObjectResolvers<ContextType>;
  Price?: PriceResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserMutations?: UserMutationsResolvers<ContextType>;
};

