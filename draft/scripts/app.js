
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

const getShortName = (assembly) => assembly.split(",")[0];

d3.json("data/assemblies.json")
	.then(source => {

		const nameMap = {};

		const data = source.filter((assembly, pos) => {
			const firstPos = source.findIndex(item => item.Name == assembly.Name);
			const isDuplicate = pos > firstPos;
			return !isDuplicate;
		});

		data.forEach((assembly, idx) => {
			assembly["id"] = idx;
			assembly["FriendlyName"] = getShortName(assembly.Name);
			nameMap[assembly.FriendlyName] = idx;
		});

		const links = data.map(assembly => 
							assembly.Dependencies.map(dep => {
								const depName = getShortName(dep);
								return { 
									source: assembly.id, 
									target: nameMap[depName]
								};
							})
						)
						.flat()
						.filter(link => link.target !== undefined); //todo
						

		const simulation = d3.forceSimulation(data)
					.force("link", d3.forceLink(links).id(d => d.id))
					.force("charge", d3.forceManyBody())
					.force("x", d3.forceX())
					.force("y", d3.forceY());

      	const width = 960;
      	const height = 600;

 		const svg = d3.select("#root")
 						.append("svg")
 							.attr("width", width)
 							.attr("height", height)
 						.append("g")
 							.attr("transform", `translate(${ width / 2}, ${ height / 2})`);

		const link = svg.append("g")
		      				.attr("stroke", "#999")
		      				.attr("stroke-opacity", 0.6)
		    			.selectAll("line")
		    				.data(links)
		    				.join("line")
		      				.attr("stroke-width", 1);

		 const scaleTotal = d3.scaleLinear()
		 						.range([2, 20])
		 						.domain(d3.extent(data, d => d.TypesInfo.Total));

		 const node = svg
		 				.append("g")
		 					.attr("class", "nodes")
						.selectAll("g")
						    .data(data)
						    .join("g")
						    	.attr("class", "node")
						    	.call(drag(simulation));


		const circles = node.append("circle").attr("r", d => scaleTotal(d.TypesInfo.Total))

		const labels = node.append("text").text(d => `${ d.FriendlyName } ${ d.Dependencies.length }`);

		simulation.on("tick", () => {

		    link
		        .attr("x1", d => d.source.x)
		        .attr("y1", d => d.source.y)
		        .attr("x2", d => d.target.x)
		        .attr("y2", d => d.target.y);

		    node.attr("transform", d => `translate(${ d.x }, ${ d.y })`);

		});

}).catch(error => console.log(err));

