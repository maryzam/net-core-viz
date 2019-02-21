
const drag = simulation => {
  
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  
  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  
  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
};

d3.json("data/assemblies.json")
	.then(source => {

		const width = 960;
      	const height = 600;

		const scaleLevel =d3.scaleLinear()
							.domain(d3.extent(source, d => d.Level))
							.range([height/2 - 50, 0]);

		const scaleTotal = d3.scaleLinear()
		 						.range([2, 25])
		 						.domain(d3.extent(source, d => d.MembersInfo.Total));

		const nameMap = {};
		const data = source.filter((assembly, pos) => {
			const firstPos = source.findIndex(item => item.Name == assembly.Name);
			const isDuplicate = pos > firstPos;
			return !isDuplicate;
		});

		data.forEach((assembly, idx) => {
			assembly["id"] = idx;
			nameMap[assembly.Name] = idx;
			assembly["y"] = scaleLevel(assembly.Level);
		});


		const links = data.map(assembly => 
							assembly.Dependencies.map(dependency => {
								return { 
									source: assembly.id, 
									target: nameMap[dependency]
								};
							})
						)
						.flat()
						.filter(link => link.target !== undefined); //todo?
						
		const simulation = d3.forceSimulation(data)
					.force("collide", d3.forceCollide().radius(d => scaleTotal(d.MembersInfo.Total) + 2))
					.force("radial", d3.forceRadial(d => scaleLevel(d.Level)))

 		const svg = d3.select("#root")
 						.append("svg")
 							.attr("width", width)
 							.attr("height", height)
 						.append("g")
 							.attr("transform", `translate(${ width / 2}, ${ 50 })`)
 							.attr("transform", `translate(${ width / 2}, ${ height / 2})`);

 		//draw circles
		const levels = new Set(data.map(d => d.Level));
		svg
			.append("g")
				.attr("class", "axis")
			.selectAll("circle")
				.data([...levels])
				.join("circle")
					.attr("r", d => scaleLevel(d))
					.style("fill", "none")
					.style("stroke", "#dadada")
					.style("stroke-width", "1px");

		//draw assemblies graph
		const link = svg.append("g")
		      				.attr("stroke", "#999")
		      				.attr("stroke-opacity", 0.6)
		    			.selectAll("line")
		    				.data(links)
		    				.join("line")
		      				.attr("stroke-width", 1);

		 const node = svg
		 				.append("g")
		 					.attr("class", "nodes")
						.selectAll("g")
						    .data(data)
						    .join("g")
						    	.attr("class", "node")
						    	.call(drag(simulation));


		const circles = node
						.append("circle")
							.attr("class", "member")
							.attr("r", d => scaleTotal(d.MembersInfo.Total))
							.style("fill", )

		const innerCircles = node
						.append("circle")
							.attr("class", "type")
							.attr("r", d => scaleTotal(d.TypesInfo.Total))
							.style("fill", )

		const labels = node.append("text").text(d => `${ d.Name } ${ d.Dependencies.length }`);

		simulation.on("tick", () => {

		    link
		        .attr("x1", d => d.source.x)
		        .attr("y1", d => d.source.y)
		        .attr("x2", d => d.target.x)
		        .attr("y2", d => d.target.y);

		    node.attr("transform", d => `translate(${ d.x }, ${ d.y })`);

		});



}).catch(error => console.log(err));
