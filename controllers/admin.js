const Product = require('../models/product');

exports.getAddProduct = (req, res) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false});
};

exports.postAddProduct = (req, res) => {
    const title = req.body.title,
          imageUrl = req.body.imageUrl,
          price = req.body.price,
          description = req.body.description,
          product = new Product({
              title: title,
              price: price,
              description: description,
              imageUrl: imageUrl,
              userId: req.user,
          });
    product
        .save()
        .then((result) => {
            // console.log(result);
            console.log('Created Product');
            res.redirect('/admin/products');
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.getEditProduct = (req, res) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then((product) => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product,
            });
        })
        .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res) => {
    const prodId = req.body.productId,
          updatedTitle = req.body.title,
          updatedPrice = req.body.price,
          updatedImageUrl = req.body.imageUrl,
          updatedDesc = req.body.description;

    Product.findById(prodId)
        .then((product) => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDesc;
            product.imageUrl = updatedImageUrl;
            return product.save()
                .then((result) => {
                    console.log('UPDATED PRODUCT!');
                    res.redirect('/admin/products');
                });
        })
        .catch((err) => console.log(err));
};

exports.getProducts = (req, res) => {
    Product.find({userId: req.user._id})
    // .select('title price -_id')
    // .populate('userId', 'name')
        .then((products) => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products',
            });
        })
        .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res) => {
    const prodId = req.body.productId;
    Product.deleteOne({_id: prodId, userId: req.user._id})
        .then(() => {
            console.log('DESTROYED PRODUCT');
            res.redirect('/admin/products');
        })
        .catch((err) => console.log(err));
};
