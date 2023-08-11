const createCategories = (categories, parentId) => {
    const categoryList = [];
    let category;

    if(parentId === null){
        category = categories.filter(cat => cat.parentId == undefined);
    }else {
        category = categories.filter(cat => cat.parentId == parentId);
    }

    for (let cate of category){
        categoryList.push({
            _id: cate._id,
            name: cate.name,
            slug: cate.slug,
            icon: cate.icon,
            categoryImage: cate.categoryImage,
            children: createCategories(categories, cate._id)
        })
    }

    return categoryList
}

exports.createCategories = createCategories;