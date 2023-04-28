const { exec } = require("child_process");
const fs = require("fs");
const readline = require("readline")

var data = {};
try{
    const fileData = fs.readFileSync("./data.json");
    data = JSON.parse(fileData);
} catch (error){
    console.log("failed to load data from file...\n",error.message, " \nassuming file doesnt exist and attempting to create file");
    fs.writeFileSync("./data.json", JSON.stringify(data))
}


const newList = (name)=>{
    if (data[name]){
        return "command failed, list already exists..."
    }
    data[name] = {
        urls: []
    }
    return `list created: ${name}`
}
const addurl = (list, url)=>{
    if (!data[list]){
        return "list not found..."
    }
    data[list].urls.push(url)
    return "url added!"
}
const removeurl = (list,query)=>{
    if (!data[list]){
        return "list not found..."
    }
    const index = data[list].urls.indexOf(query)
    if (index === -1){
        return "url not found..."
    }
    data[list].urls.splice(index, 1)
    return "url removed!"
}

//handle commands
const commands = {
    "help": ()=>{
        return `
        Available commands:
        - help: display this help message
        - makelist <name>: create a new empty list with the given name
        - addurl <list> <url>: add the given URL to the specified list
        - removeurl <list> <url>: remove the given URL from the specified list
        - list <list>: display the URLs in the specified list
        - launch <list>: launch all the URLs in the specified list in Microsoft Edge`
    },
    "makelist": (name)=>{
        if (!name){
            return "usage: makelist <name>"
        }
        return newList(name);
    },
    "addurl": (list, query)=>{
        if (!list || !query){
            return("usage: addurl <list> <url>")
        }
        return addurl(list, query)
    },
    "removeurl": (list, query)=>{
        if (!list || !query){
            return "usage: removeurl <list> <url>"
        }
        return removeurl(list, query)
    },
    "list": (list)=>{
        if (!list){
            return data
        }
        if (!data[list]){
            return "list not found..."
        }
        return data[list]
    },
    "launch": (list)=>{
        if (!list){
            return "usage: launch <list>"
        }
        if (!data[list]){
            return "list not found"
        }
        data[list].urls.forEach((url) => {
            exec(`start microsoft-edge:${url}`, (error)=>{
                if (error){
                    console.log(`failed to launch ${url}: ${error.message}`)
                }
            })
        });
        return "launching list in microsoft edge..."
    }
}
if (!process.argv[2]){
    console.log(commands["help"]())
    const interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    interface.setPrompt("> ")
    interface.on("line", (thing)=>{
        var args = thing.split(" ")
        var command = args[0]
        args.splice(0,1)
        if (commands[command]){
            console.log(commands[command](args[0], args[1]))
        }else console.log("command not found :(")
        interface.prompt()
    })
    interface.prompt()
}else console.log(commands[process.argv[2]](process.argv[3], process.argv[4]))

fs.writeFileSync("./data.json", JSON.stringify(data))