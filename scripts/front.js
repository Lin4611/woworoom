let productList = [];
let cartList = [];
const API_URL =
  "https://livejs-api.hexschool.io/api/livejs/v1/customer/lin1215";
const productWrap = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const cartTableList = document.querySelector(".shoppingCart-tableList");

const getData = async () => {
  try {
    const res = await axios.get(`${API_URL}/products`);
    console.log(res.data.products);
    return res.data.products;
  } catch (error) {
    console.log(error);
  }
};

const getCartData = async () => {
  try {
    const res = await axios.get(`${API_URL}/carts`);
    console.log(res.data.carts);
    return res.data.carts;
  } catch (error) {
    console.log(error);
  }
};

const init = async () => {
  productList = await getData();
  cartList = await getCartData();
  renderProductCards(productList);
  renderCartList(cartList);
};

const renderProductCards = (products) => {
  productWrap.innerHTML = createCardHtml(products);
};
const renderCartList = (items) => {
  cartTableList.innerHTML = createCartHtml(items);
};
const createCartHtml = (items) => {
  return items
    .map((item) => {
      return `<tr>
              <td>
                <div class="cardItem-title">
                  <img src=${item.product.images} alt=${item.product.title} />
                  <p>${item.product.title}</p>
                </div>
              </td>
              <td>NT$${item.product.price}</td>
              <td>${item.quantity}</td>
              <td>NT$${item.product.price * item.quantity}</td>
              <td class="discardBtn">
                <a href="#" class="material-icons"> clear </a>
              </td>
            </tr>`;
    })
    .join("");
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
          <button type="button" class="addCartBtn" data-id=${product.id}>加入購物車</button>
          <h3>${product.title}</h3>
          <del class="originPrice">NT$${product.origin_price}</del>
          <p class="nowPrice">NT$${product.price}</p>
        </li>`;
    })
    .join("");
};
const addCartItem = async (productId) => {
  try {
    const cartRes = await getCartData();
    const existItem = cartRes.find((item) => item.product.id === productId);
    const quantity = existItem ? existItem.quantity + 1 : 1;

    const res = await axios.post(`${API_URL}/carts`, {
      data: {
        productId: productId,
        quantity: quantity,
      },
    });
    renderCartList(res.data.carts);
  } catch (error) {
    console.log(error);
  }
};

productSelect.addEventListener("change", (e) => {
  let value = e.target.value;
  let filteredData =
    value === "全部"
      ? productList
      : productList.filter((product) => product.category === value);
  renderProductCards(filteredData);
});
productWrap.addEventListener("click", (e) => {
  if (!e.target.classList.contains("addCartBtn")) return;
  let productId = e.target.dataset.id;
  addCartItem(productId);
});
init();
