const margin = { top: 40, right: 40, bottom: 60, left: 60 };
const width = 1200 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

svg.append("defs")
  .append("linearGradient")
  .attr("id", "gradient")
  .attr("x1", "0%").attr("y1", "0%")
  .attr("x2", "0%").attr("y2", "100%")
  .selectAll("stop")
  .data([
    { offset: "0%", color: "#2d7ff9" },
    { offset: "100%", color: "#fff" }
  ])
  .enter().append("stop")
  .attr("offset", d => d.offset)
  .attr("stop-color", d => d.color);

const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

d3.csv("DDR4_8GB_2016-2026_monthly_price.csv").then(data => {
  data = data.filter(d => d["DDR4_8GB_均价(元)"] && d["DDR4_8GB_均价(元)"] > 0);
  
  data.forEach(d => {
    d.year = +d.年份;
    d.month = +d.月份;
    d.price = +d["DDR4_8GB_均价(元)"];
    d.date = new Date(d.year, d.month - 1, 1);
  });

  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.price) + 50])
    .range([height, 0]);

  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.price))
    .curve(d3.curveMonotoneX);

  const area = d3.area()
    .x(d => x(d.date))
    .y0(height)
    .y1(d => y(d.price))
    .curve(d3.curveMonotoneX);

  svg.append("path")
    .attr("class", "area")
    .attr("d", area(data));

  svg.append("path")
    .attr("class", "line")
    .attr("d", line(data));

  svg.append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(12));

  svg.append("g")
    .attr("class", "axis y-axis")
    .call(d3.axisLeft(y).ticks(10));

  svg.selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("cx", d => x(d.date))
    .attr("cy", d => y(d.price))
    .attr("r", 3.5)
    .attr("fill", "#2d7ff9")
    .on("mouseover", (event, d) => {
      tooltip.style("opacity", 1)
        .html(`${d.year}年${d.month}月<br/>价格：${d.price} 元`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });
});