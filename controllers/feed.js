const { body, validationResult } = require('express-validator');
const Post = require('../models/post');
const User = require('../models/user');
const fileHelper = require('../utill/file-helper');
const ITEM_PER_PAGE = 2;

exports.createPost = async (req, res, next) => {
  try {
    // get the post body from request
    if (!req.file) {
      // you missed the image
      const error = new Error('No image uploaded!!');
      error.statusCode = 422;
      throw error;
    }
    // check server-side validation
    const validationError = validationResult(req)
    if (!validationError.isEmpty()) {
      const error = new Error('Validation Error!!');
      error.statusCode = 422;
      throw error;
    }
    // create post on MongoDB
    const postDB = new Post({
      title: req.body.title,
      content: req.body.content,
      imageUrl: req.file.path.replace('\\', '/'),
      creator:req.userId
    });
    const post = await postDB.save()
    let user = await User.findById(req.userId)
    user.posts.push(postDB)
    user = await user.save()
    const creator = {
      email: user.email,
      name: user.name,
      _id: user._id.toString()
    }
    res.status(201).json({
      message: 'Created Post Successfuly',
      post: postDB,
      creator: creator
    });
  }
  catch(err) {
    next(err)
  }
};
exports.editPost = async (req, res, next) => {
  // get the post body from request
  let image = req.file;
  const postId = req.params.id
  const title = req.body.title
  const content = req.body.content
  // check server-side validation
  const validationError = validationResult(req)
  try {
    if (!validationError.isEmpty()) {
      const error = new Error('Validation Error!!');
      error.statusCode = 422;
      throw error;
    }
  
    // create post on MongoDB
    let post = await Post.findById({_id:postId})

    if (!post) {
      const error = new Error('Post is NOT exsists');
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not authorized');
      error.statusCode = 401;
      throw error;
    }
    post.title = title;
    post.content = content;
    if (image) {
      fileHelper.deleteFile(post.imageUrl);
      post.imageUrl = image.path.replace('\\', '/')
    }
    post = await post.save()
    res.status(200).json({
      message: 'Updated Post Successfuly',
      post: post
    }); 
  }
  catch(err) {
    next(err)
  }
};
exports.deletePost = async (req, res, next) => {
  const postId = req.params.id
  try {
    let post = await Post.findById(postId)
    if (!post) {
      const error = new Error('Post has already deleted');
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error('Unauthorized user');
      error.statusCode = 401;
      throw error;
    }
    fileHelper.deleteFile(post.imageUrl)
    post = await post.delete()
    // delete post from user model
    let user = await User.findById(req.userId)
    user.posts.pull(postId)
    user = await user.save()
    res.status(200).json({
      message: 'Removed Post Successfuly',
      post: user
    }); 
}
  catch(err) {
    next(err)
  }

}
exports.getPosts = async (req, res, next) => {
  // get posts from MongoDB
  try {
    const page = req.query.page || 1
    const totalItemsCount = await Post.find().count()
    const posts = await Post.find()
                        .skip(ITEM_PER_PAGE * (page - 1))
                        .limit(ITEM_PER_PAGE)
    res.status(200).json({
      message: 'Get Posts Successfuly',
      posts: posts,
      totalItems: totalItemsCount,
      currentPage: page,
      nextPage: page + 1,
      prevPage: page - 1,
      lastPage: Math.ceil(totalItemsCount / ITEM_PER_PAGE),
      isThereNextPage: (ITEM_PER_PAGE * page) < totalItemsCount,
      isTherePrevPage: page > 1
    })
  }
  catch(err) {
    next(err)
  }
};

exports.getPost = async (req, res, next) => {
  // get posts from MongoDB
  const postId = req.params.id
  const post = await Post.findById(postId)
  try {
    if (!post) {
      const error = new Error('Could not find post!!!');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: 'Get Post Successfuly',
      post: post
    })
  }
  catch(err) {
    next(err)
  }
};