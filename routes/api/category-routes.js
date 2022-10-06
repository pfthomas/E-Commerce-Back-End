const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findAll({
      include: [{ model: Product }]
    });
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      include: [{ model: Product}],
    });

    if (!categoryData) {
      res.status(404).json({ message: 'No category found with that id'});
      return;
    }
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});


router.post('/', (req, res) => {
  // create a new category
  Category.create({
    id: req.body.id,
    category_name: req.body.category_name,

  })
    .then((newCategory) => {
      res.status(201).json(newCategory);
    })
    .catch((err) => {
      res.status(500).json(err);
    }) 
});

router.put('/:id', (req, res) => {
  // update a category by its `id` value
  Category.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((category) => {

      return Category.findAll({ where: { id: req.params.id } });
    })
    .then((categoryId) => {
      const categoryIds = categoryId.map(({ category_id }) => category_id);
      const newCategoryIds = req.body.catIDs
        .filter((category_id) => !categoryIds.includes(category_id))
        .map((category_id) => {
          return {
            category_id: req.params.id,
            category_id,
          };
        });
      const catTagsToRemove = categoryId
        .filter(({ category_id}) => !req.body.catIDs.includes(category_id))
        .map(({ id }) => id);

      return Promise.all([
        Category.destroy({ where: { id: catTagsToRemove } }),
        Category.bulkCreate(newCategoryIds),
      ])
    })
    .then((updatedCategoryIds) => res.json(updatedCategoryIds))
    .catch((err) => {
      res.status(400).json(err);
    })
});

router.delete('/:id', (req, res) => {
  // delete a category by its `id` value
  try {
    Category.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!categoryData) {
      res.status(404).json({ message: 'No category found with this id!'});
      return;
    }
    res.status(200).json(categoryData)
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
