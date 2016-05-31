    


    var depth = 10;
    var data = null;
    var central = 236684;
    var root = {};
    console.log("we are a go!");

    function submitFunction() {
        console.log("entered submit function");

        //console.log(document.getElementById("searchWord").value);

        var word = document.getElementById("searchWord").value;


        console.log("the submitted word is: " + word);

        //shows depth-1
        var obj = document.getElementById("selectLevel").selectedIndex;
             
       // var select = obj.options[obj.selectedIndex].text;

        console.log("the depth selected is: " + obj);

        depth = Number(obj+1);
     //   startSearch(central, central+1)

    }

    //Function to find parents of a given word (etymologically)
    //input: id of the node to be expanded
    //return: Array of parent ids, or null.
    function get_parents(local_id ){

        pstring = data[local_id]["parents"];
        parray = pstring.split(" ");
        if(parray.length == 1 && parray[0]=="")
            return null;
        return parray;

    }

    //Function to find children of a given word (etymologically)
    //input: id of the node to be expanded
    //return: Array of children ids, or null.
    function get_children(local_id ){

        pstring = data[local_id]["children"];
        parray = pstring.split(" ");
        if(parray.length == 1 && parray[0]=="")
            return null;
        return parray;

    }

    //Function to find ID of a word.
    // Input: word/phrase without the name of the language.
    // Output; returns an array of all the ids where this word/phrase is found (only complete matches)
    function find_id(word){
        var ret = Array();
        for(i in data){
            phrase = data[i]["name"];
            if(phrase.split(": ")[1] == word)
                ret.push(data[i]["id"]);
        }
        return ret;
    }

    //Function to get the language of a particular name (name comes from the json)
    function get_language_from_name(name) {
        return phrase.split(": ")[0];
    }

    //Function to update the root of the tree to be used while drawing the tree
    //No input
    //No return
    //Creates the tree data structure
    function update_root(){
        root.name = data[central]["name"];
        root.id = central;
        root.depth = 0;
        root.children = get_children_nodes(root, 0, get_children);
        var temp_parents = get_children_nodes(root, 0, get_parents);

        if(root.children != null)
        {
            if ( temp_parents != null)
            root.children.concat(temp_parents);
        }
        else
        root.children = temp_parents;


    }

    //update the children nodes recursively. The ends terminate with children having an array with a null elemeent.
    //Input: Node, depth
    //Output: Children array or null
    function get_children_nodes(node, depth_local, updation_children){
        if(depth_local >= depth)
            return null;

        console.log("in get children: at depth: " + depth_local + " for: " + node.id);

        var children_local = updation_children(node.id);
        if(children_local == null)
            return null;
        console.log("got children: " + children_local);
        var children_to_return = Array();

        for(var index in children_local){
            console.log('for child: ' + children_local[index] + "in all of them as: " + children_local);
            var child_node = {};
            child_node.id = children_local[index];
            child_node.name = data[child_node.id]["name"];
            if(updation_children == get_children)
                child_node.rel = "child";
            else if(updation_children == get_parents)
                child_node.rel = "parent";
            var temp_children = get_children_nodes(child_node, depth_local+1, updation_children);
            if(temp_children!=null)
                child_node.children = temp_children;
            children_to_return.push(child_node);
            console.log("adding child as: " + child_node.id + child_node.name)
        }

        return children_to_return;
    }


    //Function to draw the tree radially
    //Currently, draws both etymological origins and derivations with the same color
    //TODO: Color the links based on node.rel -> it's "parent" or "child"
    diameter = 960;
    function draw_tree() {

        var tree = d3.layout.tree()
                .size([360, diameter / 2 - 120])
                .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

        var diagonal = d3.svg.diagonal.radial()
                .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

        var svg = d3.select("body").append("svg")
                .attr("width", diameter)
                .attr("height", diameter - 150)
                .append("g")
                .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

        var nodes = tree.nodes(root),
                links = tree.links(nodes);

        var link = svg.selectAll(".link")
                .data(links)
                .enter().append("path")
                .attr("class", "link")
                .attr("d", diagonal);

        var node = svg.selectAll(".node")
                .data(nodes)
                .enter().append("g")
                .attr("class", "node")
                .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })

        node.append("circle")
                .attr("r", 4.5);

        node.append("text")
                .attr("dy", ".31em")
                .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
                .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
                .text(function(d) { return d.name; });


    }
    d3.select(self.frameElement).style("height", diameter - 150 + "px");

    function startSearch(central, next) {
      //  var SearchWord = document.getElementById("searchWord").value;
     //   console.log("the search word: " + SearchWord);

     //   var wordIdArr;

    //    d3.select("#startSearch").on("click", wordIdArr = find_id(SearchWord));

     //   var wordId = Number(wordIdArr[0]);
     //   var wordIdNext = Number(wordId+1);

   //     console.log("ID of word: " + wordId);
        draw_multiple_trees(central, next)        

    }

    function draw_multiple_trees(min, max) {
        for(var i = min; i < max; i++)
        {
                console.log(i)
                central = i;
                update_root();
                draw_tree();
        }
    }

    //Selection of data and calling of functions initial.
    d3.json("json_children_parents.json", function(input) {
        data = input["map"];


        startSearch(central, central+1)

      // draw_multiple_trees(central, central+1)

      /*  var node = root;
        console.log("root is: " + root)
        while(node.children!=null)
        {
            console.log("exploring to: " + node.id);
            node = node.children[0];
        }*/


    });