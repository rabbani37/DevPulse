import app from "./app";
import config from "./config/index_config";
import { initDB } from "./db/db_index";







const main = () => {

    app.listen(config.port, () => {
        console.log(`Server runing on http://localhost:${config.port}/`);
    });
    initDB()
}

main()