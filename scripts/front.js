let productList = [];
const API_URL =
  "https://livejs-api.hexschool.io/api/livejs/v1/customer/lin1215";
const productWrap = document.querySelector(".productWrap");

const getData = async () => {
  try {
    const res = await axios.get(`${API_URL}/products`);
    console.log(res.data.products);
    return res.data.products;
  } catch (error) {
    console.log(error);
  }
};

const init = async () => {
  productList = await getData();
  renderProductCards(productList);
};

const renderProductCards = (products) => {
  productWrap.innerHTML = createCardHtml(products);
};
const createCardHtml = (products) => {
  return products
    .map((product) => {
      return `<li class="productCard">
          <h4 class="productType">新品</h4>
          <img
            src=${product.images}
            alt=${product.title}
          />
          <a href="#" class="addCardBtn">加入購物車</a>
          <h3>${product.title}</h3>
          <del class="originPrice">NT$${product.origin_price}</del>
          <p class="nowPrice">NT$${product.price}</p>
        </li>`;
    })
    .join("");
};
init();
