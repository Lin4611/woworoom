let orderList = [];
let chart = null;
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
  const chartData = countC3Data(orderList);
  renderChart(chartData);
  renderOrderTable(orderList);
};
const transformDate = (timeStamp) => {
  return new Date(timeStamp * 1000).toLocaleDateString();
};

const renderOrderTable = (orderData) => {
  if (orderData.length === 0) {
    orderTable.innerHTML = `
      <tr>
        <td colspan="8" class='empty-order'>
          <p>目前沒有訂單資料</p>
        </td>
      </tr>`;
    return;
  }
  orderTable.innerHTML = createTableHtml(orderData);
};

const createProductsHtml = (products) => {
  return products
    .map((product) => {
      return `<p>${product.title} * ${product.quantity}</p>`;
    })
    .join(" ");
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
    const chartData = countC3Data(newOrderData);
    renderChart(chartData);
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
    const chartData = countC3Data(newOrderData);
    renderChart(chartData);
    renderOrderTable(newOrderData);
  } catch (error) {
    console.log(error);
  }
};
const countC3Data = (orderData) => {
  const chartData = orderData.reduce((acc, order) => {
    order.products.map((product) => {
      const totalPrice = product.quantity * product.price;
      acc[product.title] = (acc[product.title] || 0) + Number(totalPrice);
    });
    return acc;
  }, {});
  return Object.entries(chartData);
};
const renderChart = (chartData) => {
  if (chartData.length === 0) {
    if (chart) {
      chart.destroy();
      chart = null;
    }
    document.querySelector("#chart").innerHTML = `
      <p>
        目前無訂單資料，無法顯示圖表
      </p>`;
    return;
  }
  if (!chart) {
    chart = c3.generate({
      bindto: "#chart", // HTML 元素綁定
      data: {
        type: "pie",
        columns: chartData,
      },
    });
  } else {
    chart.load({
      unload: true,
      columns: chartData,
    });
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
