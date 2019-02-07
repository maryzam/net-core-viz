
d3.json("data/assemblies.json")
	.then(source => {
		source.forEach((assembly, idx) => {
			assembly["FriendlyName"] = assembly.Name.split(",")[0];
			assembly["Id"] = idx;
		});
		console.log(source);
	})