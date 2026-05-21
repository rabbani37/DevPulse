import app from "./app";
import config from "./config/index_config";







const main = () => {
    app.listen(config.port, () => {
        console.log(`Server runing on http://localhost:${config.port}/`);
    })
}

main()