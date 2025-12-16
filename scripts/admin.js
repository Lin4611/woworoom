let orderList = [];
const orderTable = document.querySelector(".orderPage-table tbody");
const delAllOrderBtn = document.querySelector(".discardAllBtn");
const API_URL = "https://livejs-api.hexschool.io/api/livejs/v1/admin/lin1215";
const API_TOKEN = "dSQdka36NlOq62YaZcQkez0LVHi1";
const getOrderData = async () => {
  try {
    const res = await axios.get(`${API_URL}/orders`, {
      headers: {
        Authorization: API_TOKEN,
      },
    });
    console.log(res.data.orders);
    return res.data.orders;
  } catch (error) {
    console.log(error);
  }
};

const init = async () => {
  orderList = await getOrderData();
  renderOrderTable(orderList);
};
const transformDate = (timeStamp) => {
  return new Date(timeStamp * 1000).toLocaleDateString();
};

const renderOrderTable = (orderData) => {
  orderTable.innerHTML = createTableHtml(orderData);
};

const createProductsHtml = (products) => {
  return products
    .map((product) => {
      return `<p>${product.title} (${product.quantity})</p>`;
    })
    .join("");
};

const createTableHtml = (orderData) => {
  return orderData
    .map((item) => {
      const productHtml = createProductsHtml(item.products);

      return `<tr>
              <td>${item.id}</td>
              <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
              </td>
              <td>${item.user.address}</td>
              <td>${item.user.email}</td>
              <td>
                <p>${productHtml}</p>
              </td>
              <td>${transformDate(item.createdAt)}</td>
              <td class="orderStatus">
                <a href="#">${item.paid ? "已處理" : "未處理"}</a>
              </td>
              <td>
                <input type="button" class="delSingleOrder-Btn" data-order-id=${
                  item.id
                } value="刪除" />
              </td>
            </tr>`;
    })
    .join("");
};
const delOrderItem = async (orderId) => {
  try {
    const res = await axios.delete(`${API_URL}/orders/${orderId}`, {
      headers: {
        Authorization: API_TOKEN,
      },
    });
    let newOrderData = res.data.orders;
    renderOrderTable(newOrderData);
  } catch (error) {
    console.log(error);
  }
};
const delAllOrderItem = async () => {
  try {
    const res = await axios.delete(`${API_URL}/orders`, {
      headers: {
        Authorization: API_TOKEN,
      },
    });
    let newOrderData = res.data.orders;
    renderOrderTable(newOrderData);
  } catch (error) {
    console.log(error);
  }
};
orderTable.addEventListener("click", (e) => {
  if (!e.target.classList.contains("delSingleOrder-Btn")) return;
  let orderId = e.target.dataset.orderId;
  delOrderItem(orderId);
});
delAllOrderBtn.addEventListener("click", () => {
  delAllOrderItem();
});
init();
