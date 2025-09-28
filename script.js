// Live-simulated dashboard
const birthsPerSecond = 4.3;
const initialCondomPrice = 0.8;
const condomVolatility = 0.005;
const initialWomen = 4.02e9;
const womenAnnualGrowth = 0.008;
const secondsWindow = 60;

let babiesTotal = 0;
let condomPrice = initialCondomPrice;
let womenTotal = initialWomen;
const womenPerSecond = (womenTotal * womenAnnualGrowth) / (365*24*3600);

function formatNumber(n){
  if (n >= 1e9) return (n/1e9).toFixed(2) + ' B';
  if (n >= 1e6) return (n/1e6).toFixed(2) + ' M';
  if (n >= 1e3) return (n/1e3).toFixed(0) + ' K';
  return Math.round(n).toString();
}
function formatCurrency(n){ return '$' + n.toFixed(2); }

function buildInitialSeries(value){
  const arr = [];
  const now = new Date();
  for(let i = secondsWindow-1; i >= 0; i--){
    arr.push({ t:new Date(now - i*1000).toLocaleTimeString(), v:value });
  }
  return arr;
}

function createChart(id,label,color,data){
  const ctx = document.getElementById(id).getContext("2d");
  return new Chart(ctx,{
    type:"line",
    data:{
      labels:data.map(d=>d.t),
      datasets:[{
        label,
        data:data.map(d=>d.v),
        borderColor:color,
        backgroundColor:color+"33",
        fill:true,
        tension:0.25,
        pointRadius:0,
        borderWidth:2
      }]
    },
    options:{
      animation:false,
      responsive:true,
      maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{
        x:{ticks:{display:false},grid:{display:false}},
        y:{ticks:{color:"#aaa"},grid:{color:"rgba(255,255,255,0.05)"}}
      }
    }
  });
}

// Init charts
const babiesChart = createChart("babies-chart","Babies","rgb(124,58,237)",buildInitialSeries(0));
const condomsChart = createChart("condoms-chart","Condom Price","rgb(34,197,94)",buildInitialSeries(condomPrice));
const womenChart = createChart("women-chart","Women","rgb(14,165,233)",buildInitialSeries(womenTotal));

document.getElementById("babies-counter").textContent = formatNumber(babiesTotal);
document.getElementById("condoms-counter").textContent = formatCurrency(condomPrice);
document.getElementById("women-counter").textContent = formatNumber(womenTotal);

// Live updates
function push(chart,label,value){
  chart.data.labels.push(label);
  chart.data.datasets[0].data.push(value);
  if(chart.data.labels.length>secondsWindow){
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  chart.update("none");
}

setInterval(()=>{
  const time=new Date().toLocaleTimeString();

  babiesTotal+=birthsPerSecond;
  document.getElementById("babies-counter").textContent=formatNumber(Math.floor(babiesTotal));
  push(babiesChart,time,Math.floor(babiesTotal));

  const shock=(Math.random()-0.5)*condomVolatility*2;
  condomPrice=Math.max(0.05,condomPrice*(1+shock));
  document.getElementById("condoms-counter").textContent=formatCurrency(condomPrice);
  push(condomsChart,time,condomPrice);

  womenTotal+=womenPerSecond;
  document.getElementById("women-counter").textContent=formatNumber(Math.floor(womenTotal));
  push(womenChart,time,Math.floor(womenTotal));
},1000);

// Tabs
const tabs=document.querySelectorAll(".tab");
tabs.forEach(tab=>{
  tab.addEventListener("click",()=>{
    document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
    tab.classList.add("active");
    const target=tab.dataset.tab;
    document.querySelectorAll(".panel").forEach(p=>{
      if(p.id===target){
        p.classList.add("active"); p.removeAttribute("aria-hidden");
        // force redraw when visible
        if(target==="babies") babiesChart.update();
        if(target==="condoms") condomsChart.update();
        if(target==="women") womenChart.update();
      }else{
        p.classList.remove("active"); p.setAttribute("aria-hidden","true");
      }
    });
  });
});
