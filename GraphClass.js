export default class GraphClass {
    constructor() {
        this.graph = {
            nodes: [],
            edges: [],
            nodeDegrees: {},

        };

    }




    // Problem 6a) Compute average node degree
    computeAverageNodeDegree() {
        let vals = Object.values(this.graph.nodeDegrees);
        let sum = 0;
        let len = vals.length;
        for (let x in vals) {
            sum += vals[x];
        }
        return (sum / len);

    }




	computeConnectedNodes(){
		let max = [];
		let visited=[];
		let result=[];
		for(let x of this.graph.nodes){
			if(!visited.includes(x.id)){
				dfsRecursive(x.id,this.graph);
				if(result.length> max.length){
					max = result;
				}
				result=[];
			}

		}
			function dfsRecursive (node,graph) {
				visited.push(node);
				result.push(node);
				for(let x of graph.edges){
					if(x.source === node && !visited.includes(x.target)){
						dfsRecursive(x.target,graph);
					}
					if(x.target === node && !visited.includes(x.source)){
						dfsRecursive(x.source,graph);
					}
				}
			}

		//convert to objects
		let ret = [];
		for(let x of max){
			ret.push({id:x});
		}
		for(let x of ret){
			for(let y of this.graph.nodes){
				if(x.id===y.id){
					let toAdd = {directors:y.directors,rating:y.rating,year:y.year,rank:y.rank,duration:y.duration,genre:y.genre,cast:y.cast,writer_name:y.writer_name,largeimg:y.largeimg,smallimg:y.smallimg,moviename:y.moviename};
					x = Object.assign(x,toAdd);
					break;
				}
			}
		}
		return ret;

	}


    computeGraphDensity() {
        //graph density (2E/V(V-1)) - v nodes e edges
        let E = this.graph.edges.length;
        let V = this.graph.nodes.length;
        return ((2 * E) / (V * (V - 1)))

    }

    // Problem 2) Find Largest Connected Component
    findLargestConnectedComponent() {
		//set nodes
		let largest = new GraphClass();
        let nodes = this.computeConnectedNodes(); //updates nodes
		largest.graph.nodes = nodes;
		//set links
		let links = [];
		largest.graph.nodes.forEach(node => {
			this.graph.edges.forEach(edge=>{
				if((node.id===edge.source||node.id===edge.target)&&!links.includes(edge)){
					links.push(edge);
				}
			})
		})
		largest.graph.edges = links;

		//set nodeDegrees for largest component
		let edges = largest.graph.edges;
		for(let x of edges){
			if(x.source in largest.graph.nodeDegrees){
				largest.graph.nodeDegrees[x.source]++;
			}else{
				largest.graph.nodeDegrees[x.source] = 1;
			}
			if(x.target in largest.graph.nodeDegrees){
				largest.graph.nodeDegrees[x.target]++;
			}else{
				largest.graph.nodeDegrees[x.target] = 1;
			}
		}

		return largest.graph;
    }



    // Problem 3) Compute Graph Diameter
	findGraphDiameter() {
		let max = -1;

		function bfs(graph,source){
			const visited = new Set();
			const queue = [];
			const distance = {};

			queue.push(source);
			visited.add(source);
			distance[source] = 0;

			while (queue.length > 0) {
				const currentNode = queue.shift();

				for (const edge of graph.edges) {
					if (edge.source === currentNode && !visited.has(edge.target)) {
						const neighbor = edge.target;
						queue.push(neighbor);
						visited.add(neighbor);
						distance[neighbor] = distance[currentNode] + 1;
					} else if (edge.target === currentNode && !visited.has(edge.source)) {
						const neighbor = edge.source;
						queue.push(neighbor);
						visited.add(neighbor);
						distance[neighbor] = distance[currentNode] + 1;
					}
				}
			}

			return distance;

		}


		for (const node of this.graph.nodes) {
			const distances = bfs(this.graph, node.id);

			for (const otherNode of this.graph.nodes) {
				if (node.id !== otherNode.id) {
					if(distances[otherNode.id] !== undefined) {
						max = Math.max(max, distances[otherNode.id]);
					}
				}
			}
		}

		return max;


    }



	computeAPL(){
		let sum = 0;
		let count = 0;

		function bfs(graph,source){
			const visited = new Set();
			const queue = [];
			const distance = {};

			queue.push(source);
			visited.add(source);
			distance[source] = 0;

			while (queue.length > 0) {
				const currentNode = queue.shift();

				for (const edge of graph.edges) {
					if (edge.source === currentNode && !visited.has(edge.target)) {
						const neighbor = edge.target;
						queue.push(neighbor);
						visited.add(neighbor);
						distance[neighbor] = distance[currentNode] + 1;
					} else if (edge.target === currentNode && !visited.has(edge.source)) {
						const neighbor = edge.source;
						queue.push(neighbor);
						visited.add(neighbor);
						distance[neighbor] = distance[currentNode] + 1;
					}
				}
			}

			return distance;

		}


		for (const node of this.graph.nodes) {
			const distances = bfs(this.graph, node.id);

			for (const otherNode of this.graph.nodes) {
				if (node.id !== otherNode.id) {
					if(distances[otherNode.id] !== undefined) {
						sum+=distances[otherNode.id];
						count++;
					}
				}
			}
		}

		return (sum/count);


	}


    
}
