let orderList = [];
let chart = null;
const orderTable = document.querySelector(".orderPage-table tbody");
const delAllOrderBtn = document.querySelector(".discardAllBtn");
const API_URL = "https://livejs-api.hexschool.io/api/livejs/v1/admin/lin1215";
let API_TOKEN = "";
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
  const res = await getOrderData();
  orderList = res;
  const chartData = countC3Data(orderList);
  const sortChartData = sortC3Data(chartData);
  renderChart(sortChartData);
  renderOrderTable(orderList);
};

const sortC3Data = (chartData) => {
  const sortChartData = [...chartData].sort((a, b) => b[1] - a[1]);
  return sortChartData;
};
const transformDate = (timeStamp) => {
  return new Date(timeStamp * 1000).toLocaleDateString();
};

const renderOrderTable = (orderData) => {
  if (orderData.length === 0) {
    orderTable.innerHTML = `
      <tr>
        <td colspan="8" class='empty-order'>
          <span class="material-icons order-icon">assignment</span>
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
                <button type="button" data-order-id=${item.id}
                data-status="${item.paid}"
                class="changeStatus-Btn">
                  ${item.paid ? "已付款" : "未處理"}
                </button>
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
    orderList = res.data.orders;
    renderOrderTable(orderList);
    const chartData = countC3Data(orderList);
    const sortChartData = sortC3Data(chartData);
    renderChart(sortChartData);
  } catch (error) {
    console.log(error);
  }
};
const delAllOrderItem = async () => {
  if (orderList.length === 0) {
    alert("目前沒有訂單資料！");
    return;
  }
  if (!confirm("確定要清空表單嗎？")) {
    return;
  }
  try {
    const res = await axios.delete(`${API_URL}/orders`, {
      headers: {
        Authorization: API_TOKEN,
      },
    });
    orderList = res.data.orders;
    renderOrderTable(orderList);
    const chartData = countC3Data(orderList);
    const sortChartData = sortC3Data(chartData);
    renderChart(sortChartData);
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
      <div class="empty-chart">
        <span class="material-icons chart-icon">pie_chart</span>
        <p>目前無訂單資料，無法顯示圖表</p>
      </div>`;
    return;
  }
  const colorPattern = [
    "#301E5F",
    "#5434A7",
    "#9D7FEA",
    "#C4B5FD",
    "#DACBFF",
    "#E9D5FF",
    "#F3E8FF",
    "#FAF5FF",
  ];

  if (!chart) {
    chart = c3.generate({
      bindto: "#chart", // HTML 元素綁定
      data: {
        type: "pie",
        columns: chartData,
      },
      color: {
        pattern: colorPattern,
      },
    });
  } else {
    chart.load({
      unload: true,
      columns: chartData,
    });
  }
};
const updateStatus = async (orderId, paidStatus) => {
  if (!confirm("是否要更改訂單狀態？")) {
    return;
  }
  try {
    const res = await axios.put(
      `${API_URL}/orders`,
      {
        data: {
          id: orderId,
          paid: !paidStatus,
        },
      },
      {
        headers: {
          Authorization: API_TOKEN,
        },
      }
    );

    let newOrderData = res.data.orders;
    renderOrderTable(newOrderData);
    alert("訂單狀態修改成功！");
  } catch (error) {
    console.log(error);
  }
};
orderTable.addEventListener("click", (e) => {
  const target = e.target;
  const orderId = target.dataset.orderId;
  if (target.classList.contains("delSingleOrder-Btn")) {
    delOrderItem(orderId);
    return;
  }
  if (target.classList.contains("changeStatus-Btn")) {
    let statusString = target.dataset.status;
    let currentStatus = statusString === "true";
    updateStatus(orderId, currentStatus);
  }
});
delAllOrderBtn.addEventListener("click", () => {
  delAllOrderItem();
});
const checkAuth = () => {
  const pwd = prompt("請輸入 PIN 碼進行身分驗證");
  if (pwd === "1141218") {
    alert("歡迎您，管理員!");
    API_TOKEN = "dSQdka36NlOq62YaZcQkez0LVHi1";
    init();
  } else {
    alert("PIN 碼錯誤");
    window.location.href = "/index.html";
  }
};
checkAuth();
