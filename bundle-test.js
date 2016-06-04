/**
 * Created by May on 6/2/16.
 */
//TODO: catch all exceptions
    //TODO: create unique nodes : done
    //TODO: mouseover path highlighting: done
    //TODO: Fix mouseout -> names change: done
//TODO: find relations between 2 words



var diameter = 800,
    radius = diameter / 2,
    innerRadius = radius - 120;

CHILD_REL = "slategrey";
PARENT_REL = "gainsboro";
var depth = 2;
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

function create_uniq_nodes() {
    var waiting = Array();
    waiting.push(root);
    var found = Array();

    while(waiting.length > 0){
        var node_to_consider = waiting.shift();
        if(!found.includes(node_to_consider.id)){
            found.push(node_to_consider.id);
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


//Start from root and search outwards.
function build_search_tree(word_id) {

    seenlist = Array();
    var leaves = Array();
    var waiting = Array();
    waiting.push(root);

    console.log("in build search tree");

    while(waiting.length > 0){
        var node_to_consider = waiting.shift();
        console.log("considering:  " + node_to_consider.id);
        if(node_to_consider.id == word_id) {
            console.log("found: " + word_id);
            return node_to_consider;
        }
        if(!seenlist.includes(node_to_consider.id)){
            seenlist.push(node_to_consider.id);
            if(!node_to_consider.children){
                //create children
                depth++;
                var local_children = get_children_nodes(node_to_consider, depth-1, get_children);
                var local_parents = get_children_nodes(node_to_consider, depth-1, get_parents);
                if(local_children != null){
                    if(local_parents!=null)
                        local_children  = local_children.concat(local_parents);
                }
                else local_children = local_parents;

                if(local_children) {
                    node_to_consider.children = Array();
                    local_children.forEach( function(child_local) {
                        if(child_local.id == word_id) return child_local;
                        if(!seenlist.includes(child_local.id) )
                            node_to_consider.children.push(child_local);
                    });
                }

            }
            if(node_to_consider.children)
                node_to_consider.children.forEach(function(child){
                    waiting.push(child);
                });
        }

    }

    return null;



/*
    var local_children = get_children(cur_id);
    var local_parents = get_parents(cur_id);

    console.log("called build search tree from id: " + cur_id);

    if(local_parents != null)
        local_parents.forEach(function(child_id){
            console.log("origin is: " + child_id);
            //TODO: check if seen, if so continue
            if(!seenlist.includes(child_id)) {
                seenlist.push(child_id);
                if (word_id == child_id) {
                    //return the node here
                    var temp_node = {};
                    temp_node.id = word_id;
                    temp_node.children = null;
                    //TODo: temp_node.parent = need to set parent in the calling function
                    temp_node.rel = PARENT_REL;
                    temp_node.name = data[child_id]["name"]
                    //ALso, set depth
                    return temp_node;
                }
                var node_from_child = build_search_tree(child_id, word_id);
                if (node_from_child != null) {
                    var temp_node = {};
                    temp_node.id = child_id;
                    //TODo: temp_node.parent = need to set parent in the calling function and depth
                    temp_node.rel = PARENT_REL;
                    temp_node.name = data[child_node.id]["name"]
                    temp_node.children = [node_from_child];
                    temp_node.children[0].parent = temp_node;
                    return temp_node;
                }
            }
        });
    if(local_children != null)
        local_children.forEach(function(child_id){
            console.log("child is: " + child_id);
            //TODO: check if seen, if so continue
            if(!seenlist.includes(child_id)) {
                seenlist.push(child_id);
                if (word_id == child_id) {
                    //return the node here
                    var temp_node = {};
                    temp_node.id = word_id;
                    temp_node.children = null;
                    //TODo: temp_node.parent = need to set parent in the calling function
                    temp_node.rel = CHILD_REL;
                    temp_node.name = data[child_id]["name"]
                    //ALso, set depth
                    return temp_node;
                }
                var node_from_child = build_search_tree(child_id, word_id);
                if (node_from_child != null) {
                    var temp_node = {};
                    temp_node.id = child_id;
                    //TODo: temp_node.parent = need to set parent in the calling function and depth
                    temp_node.rel = CHILD_REL;
                    temp_node.name = data[child_node.id]["name"]
                    temp_node.children = [node_from_child];
                    temp_node.children[0].parent = temp_node;
                    return temp_node;
                }
            }
        });


    return null;*/

}

var seenlist;
function get_leaves(localnode) {
    seenlist = Array();
    var leaves = Array();
    var waiting = Array();
    waiting.push(root);

    while(waiting.length > 0){
        var node_to_consider = waiting.shift();

        if(!seenlist.includes(node_to_consider.id)){
            seenlist.push(node_to_consider.id);
            if(node_to_consider.children)
                node_to_consider.children.forEach(function(child){
                    waiting.push(child);
                });
            else
                leaves.push(node_to_consider);
        }

    }

    return leaves;


}

function update_root_with_new_node(word_id){

    build_search_tree(word_id);

    //Todo: also check if it's already present

    return false;
}

function update_root() {

    root = {};
    root.name = data[central]["name"];
    root.id = central;
    root.depth = 0;
    root.children = get_children_nodes(root, 0, get_children);
    root.parent = null;

    var temp_parents = get_children_nodes(root, 0, get_parents);

    if (root.children != null) {
        if (temp_parents != null)
            root.children = root.children.concat(temp_parents);
    }
    else
        root.children = temp_parents;

    create_uniq_nodes();
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
        child_node.id = parseInt(children_local[index]);
        child_node.name = data[child_node.id]["name"];
        if (updation_children == get_children)
            child_node.rel = CHILD_REL;
        else if (updation_children == get_parents)
            child_node.rel = PARENT_REL;
        var temp_children1 = get_children_nodes(child_node, depth_local + 1, get_children);
        var temp_children2 = get_children_nodes(child_node, depth_local + 1, get_parents);
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

function compare_words(word){
    window.alert("This functionality is coming soon ... ");

}

function word_submitted(word, depth_new){
    depth = parseInt(depth_new);
    var temp_ids = find_id(word);
    if(temp_ids != null) {
        var newid = parseInt(find_id(word)[0]);
        d3.select("svg").remove();
        draw_multiple_trees(newid, newid + 1);
    }
    else{
        //Show message
    }
}


//TODO: change colors if there are too many nodes.. only color the highlighted ones..

