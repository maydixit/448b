/**
 * Created by May on 6/2/16.
 */
//TODO: catch all exceptions

var diameter = 800,
    radius = diameter / 2,
    innerRadius = radius - 120;


var depth = 10;
var data = null;
var central = 236684;
var root = {};
var classes; // it's an array of nodes
console.log("we are a go!");

//Function to find parents of a given word (etymologically)
//input: id of the node to be expanded
//return: Array of parent ids, or null.
function get_parents(local_id) {

    pstring = data[local_id]["parents"];
    parray = pstring.split(" ");
    if (parray.length == 1 && parray[0] == "")
        return null;
    return parray;

}

//Function to find children of a given word (etymologically)
//input: id of the node to be expanded
//return: Array of children ids, or null.
function get_children(local_id) {

    pstring = data[local_id]["children"];
    parray = pstring.split(" ");
    if (parray.length == 1 && parray[0] == "")
        return null;
    return parray;

}

//Function to find ID of a word.
// Input: word/phrase without the name of the language.
// Output; returns an array of all the ids where this word/phrase is found (only complete matches)
function find_id(word) {
    var ret = Array();
    for (i in data) {
        phrase = data[i]["name"];
        if (phrase.split(": ")[1] == word)
            ret.push(data[i]["id"]);
    }
    return ret;
}

//Function to get the language of a particular name (name comes from the json)
function get_language_from_name(name) {
    return phrase.split(": ")[0];
}

function update_root() {

    //classes = Array();

    root.name = data[central]["name"];
    root.id = central;
    root.depth = 0;
    root.children = get_children_nodes(root, 0, get_children);
    root.parent = null;


    // console.log(classes);

    var temp_parents = get_children_nodes(root, 0, get_parents);

    if (root.children != null) {
        if (temp_parents != null)
            root.children = root.children.concat(temp_parents);
    }
    else
        root.children = temp_parents;
    //classes.push(root);
    // console.log("Root: ");
    //printNode(root);

}

function get_children_nodes(node, depth_local, updation_children) {
    if (depth_local >= depth)
        return null;

    var children_local = updation_children(node.id);
    if (children_local == null)
        return null;
    var children_to_return = Array();

    for (var index in children_local) {
        var child_node = {};
        child_node.id = children_local[index];
        child_node.name = data[child_node.id]["name"];
        if (updation_children == get_children)
            child_node.rel = "slategrey";
        else if (updation_children == get_parents)
            child_node.rel = "gainsboro";
        var temp_children = get_children_nodes(child_node, depth_local + 1, updation_children);
        if (temp_children != null)
            child_node.children = temp_children;
        child_node.parent = node;
        child_node.depth = depth_local;
        // classes.push(child_node);
        children_to_return.push(child_node);
        // console.log("Adding child: ");
        //printNode(child_node);
    }

    return children_to_return;
}


/*  //Function to update the root of the tree to be used while drawing the tree
 //No input
 //No return
 //Creates the tree data structure
 function update_root(){

 classes = Array();

 root.name = data[central]["name"];
 root.id = central;
 root.depth = 0;
 root.imports = get_children_nodes(root, 0, get_children);


 console.log(classes);

 var temp_parents = get_children_nodes(root, 0, get_parents);

 if(root.imports != null)
 {
 if ( temp_parents != null)
 root.imports = root.imports.concat(temp_parents);
 }
 else
 root.imports = temp_parents;
 classes.push(root);


 }

 //update the children nodes recursively. The ends terminate with children having an array with a null elemeent.
 //Input: Node, depth
 //Output: Children array or null
 function get_children_nodes(node, depth_local, updation_children){
 if(depth_local >= depth)
 return null;

 var children_local = updation_children(node.id);
 if(children_local == null)
 return null;
 var children_to_return = Array();

 for(var index in children_local){
 var child_node = {};
 child_node.id = children_local[index];
 child_node.name = data[child_node.id]["name"];
 if(updation_children == get_children)
 child_node.rel = "red";
 else if(updation_children == get_parents)
 child_node.rel = "green";
 var temp_children = get_children_nodes(child_node, depth_local+1, updation_children);
 if(temp_children!=null)
 child_node.imports = temp_children;
 classes.push(child_node);
 children_to_return.push(child_node.name);
 }

 return children_to_return;
 }
 */
var textbox;
var link;
var node;
var svg;

//Function to draw the tree radially
//Currently, draws both etymological origins and derivations with the same color
function draw_tree() {


    var cluster = d3.layout.cluster()
        .size([360, innerRadius])
        .sort(null)
        .value(function (d) {
            return 1000;
        });

    var bundle = d3.layout.bundle();
    var line = d3.svg.line.radial()
        .interpolate("bundle")
        .tension(.85)
        .radius(function (d) {
            return d.y;
        })
        .angle(function (d) {
            return d.x / 180 * Math.PI;
        });

    var diagonal = d3.svg.diagonal.radial()
        .projection(function (d) {
            return [d.y, d.x / 180 * Math.PI];
        });


    svg = d3.select("#graph").append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .append("g")
        .attr("transform", "translate(" + radius + "," + radius + ")");
    link = svg.append("g").selectAll(".link");
    node = svg.append("g").selectAll(".node");


    var nodes = cluster.nodes(root),
        links = cluster.links(nodes);

    link = link
        .data(bundle(links))
        .enter().append("path")
        .each(function (d) {
            d.source = d[0], d.target = d[d.length - 1];
        })
        .attr("class", "link")
        .style("stroke", function (d) {
            console.log(d.target.rel + " " + d.target.name);
            return d.target.rel;
        })
        .attr("d", diagonal);

    node = node
    // .data(nodes.filter(function(n) { return !n.children; }))
        .data(nodes)
        .enter().append("g").attr("class", "node")
        .attr("transform", function (d) {
            return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
        });


    node.append("circle").attr("r", 4)
        .attr("fill", function (d) {
            if (root.id == d.id) return "black";
            return d.rel;
        });
    node.append("text")
        .attr("dy", ".31em")
        .attr("dx", function (d) {
            return d.x < 180 ? "0.60em" : "-0.60em";
        })
        .style("font-size", "12px")
        .attr("transform", function (d) {
            if (d.children) return "rotate( " + (90 - d.x) + " )";
            return (    d.x < 180 ? "" : "rotate(180)");
        })
        .style("text-anchor", function (d) {
            return d.x < 180 ? "start" : "end";
        })
        .text(function (d) {
            return d.name.split(": ")[1];
        })
        .on("mouseover", mouseovered)
        .on("mouseout", mouseouted)
        .on("click", function (d) {
            d3.select("svg").remove();

            central = Number(d.id); //setting the central node
            draw_multiple_trees(central, central + 1);
        });

    //svg.selectAll(".node").data(nodes).enter().append("circle").attr("r", 2);

    //might have to change this so that this is done on the actual node (to clnk to links etc)
    // svg.selectAll(".link")
    //         .data(bundle(links))
    //         .enter().append("path")
    //         .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; }) //how to get this working?
    //         .attr("class", "link")
    //         .attr("d", line);

    // svg.selectAll(".node")
    //         .data(nodes.filter(function(n) { return !n.children; }))
    //         .enter().append("g")
    //         .attr("class", "node")
    //         .classed(".node--child", function(d) { if (d.rel == "red") return true; })
    //         .classed(".node--parent", function(d) { if (d.rel == "green") return true; })
    //         .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
    //         .append("text")
    //         .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
    //         .attr("dy", ".31em")
    //         .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
    //         .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
    //         .text(function(d) { return d.name.split(": ")[1]; })
    //         //.text(colorSelect(d))
    //         .on("click", function(d) {
    //             d3.select("svg").remove();

    //             central = Number(d.id); //setting the central node
    //             draw_multiple_trees(central, central+1);
    //         })
    //         .on("mouseover", mouseovered)
    //         .on("mouseout", mouseouted);


}

var colorSelect = function (word) {
    if (word);
};

//NOT WORKING HOW TO FIND CHILDREN?

function mouseovered(d) {
    console.log(d.name + " or : " + d);
    textbox = svg.append("text")
        .attr("x", 5)
        .attr("y", 5)
        .text("Language: " + d.name.split(": ")[0]);
    //   .text("Depth: " + d.depth);

    node
        .each(function (n) {
            n.target = n.source = false;
        });
    //   node.classed("node--background", true);
    //   link.classed("link--background", true);

    link
        .classed("link--target", function (l) {
            if (l.target === d) return l.source.source = true;
        })
        .classed("link--source", function (l) {
            if (l.source === d) return l.target.target = true;
        })
        //       .classed("link--background", function(l) {
        //         if (l.source === d) {
        //            return l.target.target = false;
        //       } else {
        //          l.target.target = true;
        //      }
        //    })
        .filter(function (l) {
            return l.target === d || l.source === d;
        })
        .each(function () {
            this.parentNode.appendChild(this);
        });

    node
        .classed("node--target", function (n) {
            return n.target;
        })
        .classed("node--source", function (n) {
            return n.source;
        });
}

function mouseouted(d) {
    textbox.remove();

    node.classed("node--background", false);
    link.classed("link--background", false);

    link
        .classed("link--target", false)
        .classed("link--source", false);

    node
        .classed("node--target", false)
        .classed("node--source", false);
}

d3.select(self.frameElement).style("height", diameter - 150 + "px");


function draw_multiple_trees(min, max) {
    for (var i = min; i < max; i++) {
        console.log(i);
        central = i;
        update_root();
        draw_tree();
    }
}

//Selection of data and calling of functions initial.
d3.json("json_children_parents.json", function (input) {
    data = input["map"];

    //with this the we can hover and change colors
    classes = data;


    draw_multiple_trees(central, central + 1);
    //draw_multiple_trees(94, 95);

    /*  var node = root;
     console.log("root is: " + root)
     while(node.children!=null)
     {
     console.log("exploring to: " + node.id);
     node = node.children[0];
     }*/


});


function packageHierarchy(classes) {
    var map = {};

    function find(name, data) {
        var node = map[name], i;
        if (!node) {
            node = map[name] = data || {name: name, children: []};
            if (name.length) {
                node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
                node.parent.children.push(node);
                node.name = name;
            }
        }
        return node;
    }

    classes.forEach(function (d) {
        find(d.name, d);
    });
    return map[""];
}
// Return a list of imports for the given array of nodes.
/*    function packageImports(nodes) {
 var map = {},
 imports = [];
 // Compute a map from name to node.
 nodes.forEach(function(d) {
 map[d.name] = d;
 });
 // For each import, construct a link from the source to target node.
 nodes.forEach(function(d) {
 if (d.imports) d.imports.forEach(function(i) {
 imports.push({source: map[d.name], target: map[i]});
 });
 });
 return imports;
 }*/

function packageImports(nodes) {
    var map = {},
        imports = [];
    // Compute a map from name to node.
    nodes.forEach(function (d) {
        map[d.id] = d;
        //console.log("adding  to map: " + d.id);
    });
    // For each import, construct a link from the source to target node.
    nodes.forEach(function (d) {
        //  console.log("Node: ");
//            printNode(d);
        if (d.children) d.children.forEach(function (child) {
            //              console.log("  child: ");
            //            printNode(child);
            imports.push({source: map[d.id], target: map[child.id]});
            //console.log("Source: " + d.id + " target: " + child.id);
        });
    });
    return imports;

}

