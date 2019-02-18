const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:10500");
        ws.on("open", () => {
            ws.send(`{ "jsonrpc": "2.0", "id": 1, "method": "eth_subscribe", "params": ["newPendingTransactions"] }`, (err, result) => {
                console.log("ERRRO : " + err);
                console.log("DATA : " + result);
			});
			// ws.send(`{ "jsonrpc": "2.0", "id": 1, "method": "eth_subscribe", "params": ["newHeads"] }`, (err, result) => {
            //     console.log("ERRRO : " + err);
            //     console.log("DATA : " + result);
            // });
            ws.on("message", (data) => {
				console.log("data : " + data);
				console.log("Type " + typeof data);
				const result = JSON.parse(data);
				if (result.params) {
					const res = result.params.result;
					console.log("res = " + res); 
				}
            });
            ws.on("error", (err) => {
                console.log("ERROR : " + err);
                process.exit(0);
            });
        });