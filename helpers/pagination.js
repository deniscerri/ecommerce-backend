const getPagination = (page, size) => {
    const limit = size ? + size : 50;
    page = (page > 0) ? page - 1 : 0
    const offset = page ? page * limit : 0;
  
    return { limit, offset };
  };
  
const getPagingData = (data, page, limit) => {
    const { count: totalItems} = data;
    let currentPage = page ? + page : 1;
    let totalPages = Math.ceil(totalItems / limit);

    if (totalPages == 0 && currentPage == 1){
      currentPage = 0
    }

    return { totalItems, items: data.rows, totalPages, currentPage };
    };


module.exports = {getPagination, getPagingData}