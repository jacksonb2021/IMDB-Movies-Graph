// import the GraphClass definition from GraphClass.js
import GraphClass from './GraphClass.js';


let clickedNode = false;
let clickedLink=false;
let lastSearched = undefined;
let GRAPH_OBJ = null;
let LARGEST_OBJ = null;
let label = 'id';

function changeType(){
	let selection = document.getElementById("labelType");
	label = selection.options[selection.selectedIndex].value;
	if(label==="id"){
		label = "id";
	}
	if(label==="name"){
		label = "name";
	}
	if(label==="genre"){
		label = "genre";
	}
	if(label==="director"){
		label = "director";
	}
	reloadGraph();

}

/*
    Given some JSON data representing a graph, render it with D3
*/
function renderGraph(graphData, searchNode) {

	let width = 1000;
	let height = 1000;
	let fromnode = null;
	let tonode = null;
	var links = JSON.parse(JSON.stringify(graphData.edges));
	var nodes = JSON.parse(JSON.stringify(graphData.nodes));


	d3.select("#theSVG").selectAll("*").remove();
	let selection = document.getElementById("graphType");
	let value = selection.options[selection.selectedIndex].value;
	let simulation;
	if(value==="force") {
		simulation = d3.forceSimulation(nodes)
			.force("link", d3.forceLink(links).id(d => d.id).distance(75))
			.force("charge", d3.forceManyBody())
			.force("center", d3.forceCenter(screen.width / 2, screen.height / 2))
			.force('x', d3.forceX().strength(0.02).x(width / 2))
			.force('y', d3.forceY().strength(0.02).y(height / 2))
			.force("collide",d3.forceCollide(10))
			.on("tick", ticked);
	} else if(value === "circular"){
		//https://observablehq.com/@d3/collision-detection
		// simulation = d3.forceSimulation(nodes)
		// 	.force("link", d3.forceLink(links).id(d => d.id))
		// 	.force("charge", d3.forceManyBody().strength(.5))
		// 	.force("center", d3.forceCenter(width / 2, height / 2))
		// 	.force('x', d3.forceX().strength(0.05).x(width / 2))
		// 	.force('y', d3.forceY().strength(0.05).y(height / 2))
		// 	.force("collide",d3.forceCollide(20).strength(0.01).radius(55))
		// 	.on("tick", ticked);
		simulation = d3.forceSimulation(nodes)
			.force("link", d3.forceLink(links).id(d => d.id))
			.force("charge", d3.forceManyBody())
			.force("center", d3.forceCenter(width / 2, height / 2))
			.force('x', d3.forceX().strength(0.05).x(width / 2))
			.force('y', d3.forceY().strength(0.05).y(height / 2))
			.force("radial", d3.forceRadial(100, width / 2, height / 2))
			.on("tick", ticked);
	}




	var svg = d3.select("#theSVG")
		.attr("viewBox", "0 -80 " + screen.width + " " + (screen.height+200))
		.attr("width", "100%")
		.attr("height", "100%")
		.on("click", function (event) {
			//clicked node, dont prompt
			if (clickedNode) {
				clickedNode = false;
				return;
			}
			if(clickedLink){
				clickedLink=false;
				return;
			}

			//add node
			const coords = d3.pointer(event);
			let id = prompt("new node ID (it will be truncated to last 3 digits)");
			if (id === null) {
				return;
			}
			const newNode = {
				id: id,
				x: coords[0],
				y: coords[1],
				flagged: true
			};
			for(let node of GRAPH_OBJ.graph.nodes){
				if(node.id===newNode.id){
					alert("A node with this ID already exists");
					return;
				}
			}


			//graphData.nodes.push(newNode);
			GRAPH_OBJ.graph.nodes.push(newNode);
			LARGEST_OBJ = new GraphClass();
			LARGEST_OBJ.graph = GRAPH_OBJ.findLargestConnectedComponent();
			if(document.getElementById("useLargest").checked){
				renderGraph(LARGEST_OBJ.graph);
			}
			else{
				renderGraph(GRAPH_OBJ.graph);
			}
		})


	//add edges
	let link = svg.append("g")
		.selectAll("line")
		.data(links).enter().append('line')
		.attr("stroke", 'black');

	//add nodes
	let node = svg.select("g")
		.selectAll()
		.data(nodes, d => d.id)
		.join('g')

	node.append("circle")
		.attr("r", 5);

	link
		.on("mousedown", function (event, d) {
			clickedLink=true;
			console.log(d);
			let bool = confirm("Do you want to delete this node? (source: " + d.source.id + " target: " + d.target.id + ")");
			if(bool===false){
				return;
			}
			let links = GRAPH_OBJ.graph.edges;
			for(let i =0;i<links.length;i++){
				if(links[i].source===d.source.id && links[i].target===d.target.id){
					links.splice(i,1);
					i--;
				}
			}
			GRAPH_OBJ.graph.edges = links;
			LARGEST_OBJ.graph = GRAPH_OBJ.findLargestConnectedComponent();
			reloadGraph();
		})
		.on("mouseover",function(event,d){
			d3.select(this)
				.attr("stroke","red")
				.attr("stroke-width",5);
		})
		.on("mouseout",function(event,d){
			d3.select(this)
				.attr("stroke","black")
				.attr("stroke-width",1);
		});

	node
		.on("mousedown", function (event, d) {
			clickedNode = true;
			fromnode = d;
		})
		.on("mouseup", function (event, d) {
			tonode = d;

			//no self loops
			if(tonode.id===fromnode.id){
				//alert("cannot connect node to itself");
				let attr = prompt("enter an attribute to change\n" +
					"id\nname\nrank\nwriter\ndirector\ngenre\ncast\n\ntype delete to delete node)");
				if(attr===null){
					return;
				}
				if(attr==="delete"){
					let links = GRAPH_OBJ.graph.edges;
					let nodes = GRAPH_OBJ.graph.nodes;
					for(let i =0;i<links.length;i++){
						if(links[i].source===fromnode.id || links[i].target===fromnode.id){
							links.splice(i,1);
							i--;
						}
					}
					for(let i =0;i<nodes.length;i++){
						if(nodes[i].id===fromnode.id){
							nodes.splice(i,1);
							i--;
						}
					}
					GRAPH_OBJ.graph.edges = links;
					GRAPH_OBJ.graph.nodes = nodes;
					LARGEST_OBJ.graph = GRAPH_OBJ.findLargestConnectedComponent();
					reloadGraph()
					return;
				}
				let val = prompt("enter new value");
				if(val===null){
					return;
				}
				let node=null;
				for(let x of GRAPH_OBJ.graph.nodes){
					if(x.id===fromnode.id){
						node = x;
						break;
					}
				}
				console.log(node);
				//let node = searchByAttr(x,y);
				// if(node===undefined){
				// 	alert("could not find node with that attribute");
				// 	return;
				// }
				changeElement(node,attr,val);

				return;
			}

			//check if edge exists
			for(let x in graphData.edges){
				if(graphData.edges[x]["source"] === fromnode.id && graphData.edges[x]["target"] === tonode.id){
					alert("an edge already exists between these nodes")
					return;
				}
			}
			GRAPH_OBJ.graph.edges.push({source: fromnode.id, target: tonode.id});
			LARGEST_OBJ = new GraphClass();
			LARGEST_OBJ.graph = GRAPH_OBJ.findLargestConnectedComponent();
			if(document.getElementById("useLargest").checked){
				renderGraph(LARGEST_OBJ.graph);
			}
			else{
				renderGraph(GRAPH_OBJ.graph);
			}
		})

		//make bigger on hover
		.on("mouseover", function (event, d) {
			d3.select(this).select("circle").attr("r", 10);
			d3.select(this).select("text").attr("style", "font-size:15");

			if(label==="id"){
				d3.select(this).select("text").text(d=>d.id);
			}
			if(label==="name"){
				d3.select(this).select("text").text(d=>d.moviename);
			}
			if(label==="genre"){
				d3.select(this).select("text").text(d=>d.genre);
			}
			if(label==="director"){
				d3.select(this).select("text").text(d=>d.directors);
			}
			setInfo(d);
		})
		.on("mouseout", function (event, d) {
			d3.select(this).select("circle").attr("r", 5);
			d3.select(this).select("text").attr("style", "font-size:10");
			if(label==="id") {
				d3.select(this).select("text").text(d => d.id.slice(-3));
			}
			if(label==="name"){
				d3.select(this).select("text").text(d=>d.moviename.slice(0,5));
			}
			if(label==="genre"){
				d3.select(this).select("text").text(d=>d.genre.slice(0,5));
			}
			if(label==="director"){
				d3.select(this).select("text").text(d=>d.directors.slice(0,5));
			}
		});


	//add textlabel
	if(label==="id"){
		node.append("text")
			.attr("x", 0)
			.attr("y", 8)
			.attr("style", "font-size:10")
			.attr("stroke", "green")
			.text(d => d.id.slice(-3))
	}
	if(label==="name"){
		node.append("text")
			.attr("x", 0)
			.attr("y", 8)
			.attr("style", "font-size:10")
			.attr("stroke", "green")
			.text(d => d.moviename.slice(0,5))
	}
	if(label==="genre"){
		node.append("text")
			.attr("x", 0)
			.attr("y", 8)
			.attr("style", "font-size:10")
			.attr("stroke", "green")
			.text(d => d.genre.slice(0,5))
	}
	if(label==="director"){
		node.append("text")
			.attr("x", 0)
			.attr("y", 8)
			.attr("style", "font-size:10")
			.attr("stroke", "green")
			.text(d => d.directors.slice(0,5))
	}



	//set x and y pos
	function ticked() {
		link
			.attr("x1", d => d.source.x)
			.attr("y1", d => d.source.y)
			.attr("x2", d => d.target.x)
			.attr("y2", d => d.target.y);

		node.attr("transform", d => `translate(${(d.x)}, ${(d.y)})`);
	}

	if(searchNode!=null){
		let nodes = graphData.nodes;
		let shrinknodes = [];
		for(let x of nodes){
			if(!searchNode.includes(x.id)){
				shrinknodes.push(x);
			}
		}
		for(let x of shrinknodes){
			node.filter(d => d.id === x).select("circle").attr("r", 3);
			node.filter(d => d.id === x).select("text").attr("style", "font-size:5");
		}
		for(let x of searchNode){
			node.filter(d => d.id === x).select("circle").attr("r", 10).attr("fill","red");
			if(label==="id") {
				node.filter(d => d.id === x).select("text").attr("stroke", "blue").attr("style", "font-size:15").text(d => d.id);
			}
			if(label==="name"){
				node.filter(d => d.id === x).select("text").attr("stroke", "blue").attr("style", "font-size:15").text(d => d.moviename);
			}
			if(label==="genre"){
				node.filter(d => d.id === x).select("text").attr("stroke", "blue").attr("style", "font-size:15").text(d => d.genre);
			}
			if(label==="director"){
				node.filter(d => d.id === x).select("text").attr("stroke", "blue").attr("style", "font-size:15").text(d => d.directors);
			}

		}


		//setInfo(searchNode);
		if(searchNode.length==1){
			node.filter(d=>d.id===searchNode.id).each(function(d){
				setInfo(d);
			});
		}




	}

}

/*
    Function to fetch the JSON data from output_graph.json & call the renderGraph() method
    to visualize this data
*/
function loadAndRenderGraph(fileName) {
	fetch("movie-img_links.json")
		.then(response => response.json())
		.then(data => {
				//let graph = new GraphClass();
				for (let x of data) {
					graphObj.graph.nodes.push({id: x.id,largeimg:x.large_img_link,smallimg:x.small_img_link,moviename:x.name});
					//console.log(x);
				}
				//console.log(graphObj.graph.nodes);
				GRAPH_OBJ = graphObj;
				LARGEST_OBJ = new GraphClass();
				LARGEST_OBJ.graph = graphObj.findLargestConnectedComponent();
				renderGraph(graphObj.graph);


			}
		)
		.catch(error => console.error('There was an error!', error));

	fetch("imdb_data.json")
		.then(response => response.json())
		.then(data => {
				//let graph = new GraphClass();
				for (let x of data.nodes) {
					let toAdd = {directors:x.director_name,rating:x.imdb_rating,year:x.year,rank:x.rank,duration:x.duration,genre:x.genre,cast:x.cast_name,writer_name:x.writter_name};
					for(let y of graphObj.graph.nodes){
						if(y.id===x.id){
							y = Object.assign(y,toAdd);
							break;
						}
					}
				}
				GRAPH_OBJ = graphObj;
				LARGEST_OBJ = new GraphClass();
				LARGEST_OBJ.graph = graphObj.findLargestConnectedComponent();
				renderGraph(graphObj.graph);
				//console.log(graphObj.graph.nodes);


			}
		)
		.catch(error => console.error('There was an error!', error));

	fetch(fileName)
		.then(response => response.json())
		.then(data => {
				//let graph = new GraphClass();
				// for (let x in data.graph.nodes) {
				// 	graphObj.graph.nodes.push({id: data.graph.nodes[x]});
				// }

				for (let x in data.graph.edges) {
					graphObj.graph.edges.push({
						source: data.graph.edges[x][0],
						target: data.graph.edges[x][1]
					})
				}

				///https://stackoverflow.com/questions/10654992/how-can-i-get-a-collection-of-keys-in-a-javascript-dictionary

				Object.entries(data.graph.nodeDegrees).forEach(([key, value]) => {
					graphObj.graph.nodeDegrees[key] = value;
				});

				GRAPH_OBJ = graphObj;
				LARGEST_OBJ = new GraphClass();
				LARGEST_OBJ.graph = graphObj.findLargestConnectedComponent();
				renderGraph(graphObj.graph);


			}
		)
		.catch(error => console.error('There was an error!', error));
}

/*
    A method to compute simple statistics (Programming part Subproblem 6)
    on updated graph data
*/
function displayGraphStatistics() {
	let check = document.getElementById("useLargest");
	let graph;
	if(check.checked){
		graph = LARGEST_OBJ;
	}
	else{
		graph = GRAPH_OBJ;
	}
	let nodeDegree = document.getElementById("avgDegree");
	nodeDegree.innerText = graph.computeAverageNodeDegree();

	let density = document.getElementById("graphDensity");
	density.innerText = graph.computeGraphDensity();

	let diameter = document.getElementById("graphDiameter");
	diameter.innerText = graph.findGraphDiameter();

	let nodeCount = document.getElementById("numOfNodes");
	nodeCount.innerText = graph.graph.nodes.length;

	let linkCount = document.getElementById("numOfLinks");
	linkCount.innerText = graph.graph.edges.length;

	let APL = document.getElementById("APL");
	APL.innerText = graph.computeAPL();
}

function searchNode(){
	let largestConnected = document.getElementById("useLargest");
	let theGraph;
	if(largestConnected.checked){
		theGraph = LARGEST_OBJ;
	}
	else{
		theGraph= GRAPH_OBJ;
	}
	let nodes = [];
	const radioButtons = document.getElementsByName("to_change");
	let attr = null;
	for (const radioButton of radioButtons) {
		if (radioButton.checked) {
			attr = radioButton.value;
			break;
		}
	}
	let value = document.getElementById("searchNode").value;
	document.getElementById("searchNode").value = "";
	if(value===undefined){
		alert("please enter a value to search by");
		return;

	}

	if(attr ===null){
		alert("please select an attribute to search by");
		return;
	}
	if(attr ==="id"){
		renderGraph(theGraph.graph, [value]);
		return;
	}
	if(attr ==="name"){
		for(let node of theGraph.graph.nodes){
			if(node.moviename===value){
				nodes.push(node.id);
			}
		}
	}
	if(attr ==="director"){
		for(let node of theGraph.graph.nodes){
			if(node.directors===value){
				nodes.push(node.id);
			}
		}
	}
	if(attr ==="rank"){
		for(let node of theGraph.graph.nodes){
			if(node.rank===value){
				nodes.push(node.id);

			}
		}
	}
	if(attr ==="writer"){
		for(let node of theGraph.graph.nodes){
			if(node.writer===value){
				nodes.push(node.id);

			}
		}
	}
	if(attr ==="cast"){
		for(let node of theGraph.graph.nodes){
			if(node.cast===value){
				nodes.push(node.id);

			}
		}
	}
	if(attr ==="genre"){
		for(let node of theGraph.graph.nodes){
			if(node.genre===value){
				nodes.push(node.id);

			}
		}
	}

	//lastSearched = node;
	if(nodes.length==0){
		alert("could not find node with that attribute");
		return;
	}
	renderGraph(theGraph.graph, nodes);
	//highlightNodes([node]);


}

function largestConnected(element){
	if(element.checked){
		renderGraph(LARGEST_OBJ.graph);
	}
	else{
		reloadGraph()
	}


}

function reloadGraph(){
	if(document.getElementById("useLargest").checked){
		renderGraph(LARGEST_OBJ.graph);
	}
	else{
		renderGraph(GRAPH_OBJ.graph);
	}
}


function searchByAttr(attr,value){
	let largestConnected = document.getElementById("useLargest");
	let theGraph;
	if(largestConnected.checked){
		theGraph = LARGEST_OBJ;
	}
	else{
		theGraph= GRAPH_OBJ;
	}
	if(attr===undefined){
		const radioButtons = document.getElementsByName("to_change");
		attr = null;
		for (const radioButton of radioButtons) {
			if (radioButton.checked) {
				attr = radioButton.value;
				break;
			}
		}
	}
	if(value===undefined){
		value = document.getElementById("searchVal").value;
		document.getElementById("searchVal").value = "";

	}

	if(attr ===null){
		alert("please select an attribute to search by");
		return;
	}
	if(attr ==="id"){
		searchNode();
		return;
	}
	if(attr ==="name"){
		for(let node of theGraph.graph.nodes){
			if(node.moviename===value){
				return node;
			}
		}
	}
	if(attr ==="director"){
		for(let node of theGraph.graph.nodes){
			if(node.directors===value){
				return node;
			}
		}
	}
	if(attr ==="rank"){
		for(let node of theGraph.graph.nodes){
			if(node.rank===value){
				return node;
			}
		}
	}
	if(attr ==="writer"){
		for(let node of theGraph.graph.nodes){
			if(node.writer===value){
				return node;
			}
		}
	}
	if(attr ==="cast"){
		for(let node of theGraph.graph.nodes){
			if(node.cast===value){
				return node;
			}
		}
	}
	if(attr ==="genre"){
		for(let node of theGraph.graph.nodes){
			if(node.genre===value){
				return node;
			}
		}
	}
	//alert("could not find node with that attribute");

}

function changeElement(node,toChange,value){
	for(let i =0;i<GRAPH_OBJ.graph.nodes.length;i++){
		if(GRAPH_OBJ.graph.nodes[i].id===node.id){

			GRAPH_OBJ.graph.nodes.splice(i,1);
			break;

		}
	}
	if(toChange==="name"){
		node.moviename = value;
	}
	if(toChange==="rank"){
		node.rank = value;
	}
	if(toChange==="director"){
		node.directors = value;
	}
	if(toChange==="writer"){
		node.writer = value;
	}
	if(toChange==="cast"){
		node.cast = value;
	}
	if(toChange==="genre"){
		node.genre = value;
	}
	if(toChange==="id"){
		node.id = value;
	}
	console.log(node);
	GRAPH_OBJ.graph.nodes.push(node);
	renderGraph(GRAPH_OBJ.graph);
}

// function changeElement(){
// 	let text = document.getElementById("toChangeText");
// 	let toChange
// = null;
// 	if(text.value===""){
// 		alert("please enter a value to change to");
// 		return;
// 	}
// 	let val = text.value;
// 	text.value="";
// 	let node = searchByAttr();
//
//
//
// }
function setInfo(node){
	document.getElementById("movieName").innerText = node.moviename;
	//document.getElementById("smallImg").src = node.smallimg;
	document.getElementById("moviePoster").src = node.largeimg;
	document.getElementById("movieDirectors").innerText = node.directors;
	document.getElementById("movieRating").innerText = node.rating;
	document.getElementById("movieYear").innerText = node.year;
	document.getElementById("movieRank").innerText = node.rank;
	document.getElementById("movieDuration").innerText = node.duration;
	document.getElementById("movieGenre").innerText = node.genre;
	document.getElementById("movieID").innerText = node.id;

}

function highlightNodes(list){
	//list is a list of node ID
	let largestConnected = document.getElementById("useLargest");
	let theGraph;
	if(largestConnected.checked){
		theGraph = LARGEST_OBJ;
	}
	else{
		theGraph= GRAPH_OBJ;
	}
	let nodes = theGraph.graph.nodes;
	let links = theGraph.graph.edges;
	for(let x of nodes){


	}
}

let graphObj = new GraphClass();

let fileName = "output_graph.json"

loadAndRenderGraph(fileName);

window._something = {displayGraphStatistics, searchNode, reloadGraph, largestConnected,changeType}

