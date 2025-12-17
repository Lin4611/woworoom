let productList = [];
let cartList = [];
const API_URL =
  "https://livejs-api.hexschool.io/api/livejs/v1/customer/lin1215";
const productWrap = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const cartTableList = document.querySelector(".shoppingCart-tableList");
const discardAllBtn = document.querySelector(".discardAllBtn");
const totalPriceText = document.querySelector(".total-price");
const orderForm = document.querySelector(".orderInfo-form");
const checkoutEl = {
  name: document.getElementById("customerName"),
  tel: document.getElementById("customerPhone"),
  email: document.getElementById("customerEmail"),
  address: document.getElementById("customerAddress"),
  payment: document.getElementById("tradeWay"),
};
const requiredFields = [
  {
    input: checkoutEl.name,
    message: document.querySelector('[data-message="姓名"]'),
  },
  {
    input: checkoutEl.tel,
    message: document.querySelector('[data-message="電話"]'),
  },
  {
    input: checkoutEl.email,
    message: document.querySelector('[data-message="Email"]'),
  },
  {
    input: checkoutEl.address,
    message: document.querySelector('[data-message="寄送地址"]'),
  },
];
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
    return {
      cartData: res.data.carts,
      totalPrice: res.data.finalTotal,
    };
  } catch (error) {
    console.log(error);
  }
};

const init = async () => {
  productList = await getData();
  const { cartData, totalPrice } = await getCartData();
  renderProductCards(productList);
  renderCartList(cartData, totalPrice);
};

const renderProductCards = (products) => {
  productWrap.innerHTML = createCardHtml(products);
};
const renderCartList = (items, totalPrice) => {
  const tableHead = document.querySelector(".shoppingCart-table thead");
  const tableFoot = document.querySelector(".shoppingCart-table tfoot");

  if (items.length === 0) {
    tableHead.style.display = "none";
    tableFoot.style.display = "none";
    cartTableList.innerHTML = `
      <tr>
        <td class='empty-state-table'>
          <span class="material-icons cart-icon">shopping_cart_checkout</span>
          <p>目前購物車沒有品項，快去選購吧！</p>
        </td>
      </tr>
    `;
  } else {
    tableHead.style.display = "";
    tableFoot.style.display = "";
    cartTableList.innerHTML = createCartHtml(items);
  }
  totalPriceText.textContent = `NT$${totalPrice}`;
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
                <button type="button" class="material-icons delCartBtn" data-id=${
                  item.product.id
                } data-cart-id=${item.id}> clear </button>
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
    const { cartData } = await getCartData();
    const existItem = cartData.find((item) => item.product.id === productId);
    const quantity = existItem ? existItem.quantity + 1 : 1;

    const res = await axios.post(`${API_URL}/carts`, {
      data: {
        productId: productId,
        quantity: quantity,
      },
    });
    let newCartData = res.data.carts;
    let totalPrice = res.data.finalTotal;
    renderCartList(newCartData, totalPrice);
  } catch (error) {
    console.log(error);
  }
};
const delCartItem = async (cartId) => {
  try {
    const res = await axios.delete(`${API_URL}/carts/${cartId}`);
    let newCartData = res.data.carts;
    let totalPrice = res.data.finalTotal;
    renderCartList(newCartData, totalPrice);
  } catch (error) {
    console.log(error);
  }
};
const delCartAllItem = async () => {
  try {
    const res = await axios.delete(`${API_URL}/carts`);
    let newCartData = res.data.carts;
    let totalPrice = res.data.finalTotal;
    renderCartList(newCartData, totalPrice);
  } catch (error) {
    console.log(error);
  }
};
const validatePhone = (phone) => {
  const re = /^09\d{8}$/;
  return re.test(phone);
};
const validateEmail = (email) => {
  const re =
    /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
  return re.test(email);
};
const validCheckoutInputs = () => {
  let isValid = true;

  requiredFields.forEach(({ input, message }) => {
    let isFormValid = true;
    const value = input.value.trim();
    if (!value) {
      isValid = false;
      message.textContent = "必填";
      message.classList.add("active");
      input.classList.add("error");
      return;
    }

    if (input.name === "Email" && !validateEmail(value)) {
      isFormValid = false;
      message.textContent = "Email格式錯誤";
    } else if (input.name === "電話" && !validatePhone(value)) {
      isFormValid = false;
      message.textContent = "電話格式錯誤 (需為 09 開頭共 10 碼)";
    }
    if (!isFormValid) {
      isValid = false;
      message.classList.add("active");
      input.classList.add("error");
    } else {
      message.classList.remove("active");
      input.classList.remove("error");
    }
  });

  return isValid;
};

const sendCheckout = async () => {
  let checkoutData = {
    name: checkoutEl.name.value.trim(),
    tel: checkoutEl.tel.value.trim(),
    email: checkoutEl.email.value.trim(),
    address: checkoutEl.address.value.trim(),
    payment: checkoutEl.payment.value,
  };
  try {
    const res = await axios.post(`${API_URL}/orders`, {
      data: {
        user: checkoutData,
      },
    });
    alert("成功送出");
    orderForm.reset();
    const { cartData, totalPrice } = await getCartData();
    renderCartList(cartData, totalPrice);
    return res.data.user;
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
productWrap.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("addCartBtn")) return;
  const addBtn = e.target;
  let productId = e.target.dataset.id;
  addBtn.disabled = true;
  addBtn.textContent = "加入中...";
  await addCartItem(productId);
  addBtn.disabled = false;
  addBtn.textContent = "加入購物車";
  alert("加入成功");
});
cartTableList.addEventListener("click", (e) => {
  if (!e.target.classList.contains("delCartBtn")) return;
  let cartId = e.target.dataset.cartId;
  delCartItem(cartId);
});
discardAllBtn.addEventListener("click", () => {
  delCartAllItem();
});
orderForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const isFormValid = validCheckoutInputs();
  if (isFormValid) {
    sendCheckout();
  } else {
    return;
  }
});
init();
