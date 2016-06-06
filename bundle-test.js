/**
 * Created by May on 6/2/16.
 */
//TODO: catch all exceptions
//TODO: create unique nodes : done
//TODO: mouseover path highlighting: done
//TODO: Fix mouseout -> names change: done
//TODO: find relations between 2 words
//TODo: clean up data to remove -less, -er etc.

// if it reaches the root node in depth 5, then cool, we redraw the tree.. with a certain depth.
    // if it reaches another

var diameter = 800,
    radius = diameter / 2,
    innerRadius = radius - 120;

CHILD_REL = "slategrey";
PARENT_REL = "gainsboro";
var depth = 5;
var data = null;
var central = 236684;
var root = {};
var classes; // it's an array of nodes
highlight_color = {};
highlight_color[CHILD_REL] = "black";
highlight_color[PARENT_REL] = "blue";

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
    console.log("in find id")
    var ret = Array();
    var found_one = false;
    for (i in data) {
        phrase = data[i]["name"];
        if (phrase.split(": ")[1] == word){
            ret.push(data[i]["id"]);
            found_one = true;
        }
    }

    if(found_one)
        return ret;
    else return null;
}

//Function to get the language of a particular name (name comes from the json)
function get_language_from_name(name) {
    return phrase.split(": ")[0];
}
var seenList;
var nodelist;
function create_uniq_nodes() {
    var waiting = Array();
    waiting.push(root);
    seenList = Array();
    nodelist = Array();

    while(waiting.length > 0){
        var node_to_consider = waiting.shift();
        if(!seenList.includes(node_to_consider.id)){
            seenList.push(node_to_consider.id);
            nodelist.push(node_to_consider);
            if(node_to_consider.children)
                node_to_consider.children.forEach(function(child){
                    waiting.push(child);
                });
        }
        else
        {
            node_to_consider.parent.children.splice(node_to_consider.parent.children.indexOf(node_to_consider), 1);
        }

    }
}

function update_root(depth_max) {

    root = {};
    root.name = data[central]["name"];
    root.id = central;
    root.depth = 0;
    root.children = get_children_nodes(root, 0, get_children, depth_max);
    root.parent = null;

    var temp_parents = get_children_nodes(root, 0, get_parents, depth_max);

    if (root.children != null) {
        if (temp_parents != null)
            root.children = root.children.concat(temp_parents);
    }
    else
        root.children = temp_parents;

    create_uniq_nodes();
}

function get_children_nodes(node, depth_local, updation_children, depth_max) {
    if (depth_local >= depth_max)
        return null;

    var children_local = updation_children(node.id);
    if (children_local == null)
        return null;
    var children_to_return = Array();

    for (var index in children_local) {
        var child_node = {};
        child_node.id = parseInt(children_local[index]);
        child_node.name = data[child_node.id]["name"];
        if (updation_children == get_children)
            child_node.rel = CHILD_REL;
        else if (updation_children == get_parents)
            child_node.rel = PARENT_REL;
        var temp_children1 = get_children_nodes(child_node, depth_local + 1, get_children, depth_max);
        var temp_children2 = get_children_nodes(child_node, depth_local + 1, get_parents, depth_max);
        if (temp_children1 != null){
            if(temp_children2 != null){
                temp_children1 = temp_children1.concat(temp_children2);
            }
            child_node.children = temp_children1;
        }
        else if(temp_children2 != null) child_node.children = temp_children2;
        child_node.parent = node;
        child_node.depth = depth_local;
        children_to_return.push(child_node);

    }
    return children_to_return;
}

var textbox;
var link;
var node;
var svg = null;


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



//Function to draw the tree radially
//Currently, draws both etymological origins and derivations with the same color
function draw_tree() {


    if(svg != null) svg.selectAll("*").remove();
    d3.select("#graph").empty();
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
        })
        .on("mouseover", mouseovered)
        .on("mouseout", mouseouted)
        .on("click", function (d) {
            d3.select("svg").remove();

            console.log("Resetting central id in click");
            central = Number(d.id); //setting the central node
            draw_multiple_trees(central, central + 1);
        });
    node.append("text")
        .attr("dy", ".31em")
        .attr("dx", function (d) {
            return d.x < 180 ? "0.60em" : "-0.60em";
        })
        .style("font-size", "12px")
        //    .style("fill", "lightgrey")
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

            console.log("Resetting central id in click");
            central = Number(d.id); //setting the central node
            draw_multiple_trees(central, central + 1);
        });

}

var colorSelect = function (word) {
    if (word);
};

//NOT WORKING HOW TO FIND CHILDREN?

function find_links_to_root(node) {

    if (node.id == root.id) return null;
    return_nodes = Array();
    while (true) {
        if(node.id != root.id){
            console.log("adding " + node.id);
            return_nodes.push(node);}
        else break;
        node = node.parent;

    }
    return return_nodes;

}
function highlight_path(node_temp) {

}
var nodes_to_highlight;
function mouseovered(d) {

    nodes_to_highlight = find_links_to_root(d);

    link.style('stroke', function(l){
        if(nodes_to_highlight == null) return null;
        if (nodes_to_highlight.includes(l.target))
            return (highlight_color[l.target.rel]);
        else return null;
    });

    d3.select(this).text(d.name.split(": ")[1]).style("font-weight", "bold")
        .style("font-size", "14px");

    highlight_path(d);


    info = d3.select("svg").append("g")

        .append("text")
        //   .attr("x", xpos)
        .attr("y", 50)
        //  .text("Language: " + d.name.split(": ")[0] +  + "Depth: "+ d.depth );
        .html("Language: " + d.name.split(": ")[0] + ", " + "Depth: "+ d.depth );

}

function mouseouted(d) {

    info.remove();
    link.style('stroke', function(l){
        return l.target.rel;
    });

    d3.select(this).text(d.name.split(": ")[1])
        .style("font-size", "12px")
        .style("font-weight", "normal");

}

d3.select(self.frameElement).style("height", diameter - 150 + "px");


function draw_multiple_trees(min, max) {
    for (var i = min; i < max; i++) {
       // console.log(i);
        central = i;
        update_root(depth);
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
    //   update_root_with_new_node(1158614);
    // draw_tree();
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

function get_current_node_list(){
    function node_list_step(temp_node) {
        var ret = [temp_node.id]

    }

    return node_list_step(root);
}

function create_search(temp_ids) {
    current_seen_list = seenList;
    current_node_list = nodelist;
    var found_val = false;

    function find_depth(seenval, current_node_list) {
        for(index in current_node_list){
            if(current_node_list[index].id == seenval)
                return current_node_list[index].depth;
        }
        return 0;
    }
    depth_in_tree = 0;
    id_to_consider = 0;
    for(d = 1; d < 6; d++){

        for (i in temp_ids){
            id_to_consider = temp_ids[i];
            console.log("Looping for id: " + temp_ids[i]);
            central = temp_ids[i];

            depth = d;
            update_root(depth);
            console.log("root has been updated");


            for(seenval in seenList){
                if(current_seen_list.includes(seenList[seenval])){
                    depth_in_tree = find_depth(seenList[seenval], current_node_list)
                    found_val = true;
                    console.log("WE FOUND OUR VALUE" + seenList + " " + current_seen_list + " at depth: " + depth_in_tree + " and d : " + d)
                    break;
                }
            }
            console.log("WE ? OUR VALUE" + seenList + " " + current_seen_list)
        }
        if(found_val){
            depth = depth_in_tree + d;
            console.log("FINAL :  " + id_to_consider + " at depth" + depth)
            d3.select("svg").remove();
            draw_multiple_trees(parseInt(id_to_consider), parseInt(id_to_consider)+1);
            break;
        }
    }
}
function compare_words(word){
    //window.alert("This functionality is coming soon ... ");
    var temp_ids = find_id(word);
    console.log("found id" + temp_ids)
    create_search(temp_ids);

    /* if(temp_ids != null) {
     var newid = parseInt(find_id(word)[0]);
     var root1 = {}
     update_root(root1, newid)
     }
     function compare_trees(root1, root) {

     }

     compare_trees(root1, root); // compare if the two roots have any node in common, if so, reset the depth and redraw the tree
     */
}

function word_submitted(word, depth_new){
    depth = parseInt(depth_new);
    var temp_ids = find_id(word);
    console.log("calling find id from word submitted ")
    if(temp_ids != null) {
        var newid = parseInt(temp_ids[0]);
        d3.select("svg").remove();
        draw_multiple_trees(newid, newid + 1);
    }
    else{
        //Show message
    }
}


//TODO: change colors if there are too many nodes.. only color the highlighted ones..

