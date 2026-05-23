

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";

// src/module/users/users.router.ts
import { Router } from "express";

// src/db/db_index.ts
import { Pool } from "pg";

// src/config/index_config.ts
import dotenv from "dotenv";
import { env } from "process";
dotenv.config({ quiet: true });
var config = {
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  access_secret: env.ACCESS_SECRET,
  refresh_secret: env.REFRESH_SECRET,
  project_type: env.PROJECT_TYPE
};
var index_config_default = config;

// src/db/db_index.ts
var pool = new Pool({
  connectionString: index_config_default.databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});
var initDB = async () => {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(30) NOT NULL,
        email VARCHAR(40) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(15) DEFAULT 'contributor' NOT NULL,

        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )`);
  await pool.query(`
        CREATE TABLE IF NOT EXISTS issues(
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL CHECK(LENGTH (description) >=20),
        type VARCHAR(20) NOT NULL CHECK(type IN ('bug', 'feature_request')),
        status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved')),
        reporter_id INT NOT NULL,

        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )`);
  console.log("Database connected...");
};

// src/module/users/users.services.ts
import bcrypt from "bcrypt";

// src/utility/jwt.ts
import jwt from "jsonwebtoken";
var signToken = (payload) => {
  const accessToken = jwt.sign(payload, index_config_default.access_secret, { expiresIn: "20d" });
  const refreshToken = jwt.sign(payload, index_config_default.refresh_secret, { expiresIn: "30d" });
  return { accessToken, refreshToken };
};
var jwt_default = signToken;

// src/module/users/users.services.ts
var AuthService = class {
  async userCreateAuth(user) {
    const { name, email, password_hash, role } = user;
    const hash = await bcrypt.hash(password_hash, 10);
    const rslt = await pool.query(`
            INSERT INTO users(name, email, password_hash, role) VALUES($1, $2, $3, $4)

            RETURNING id, name, email, role, created_at, updated_at 
            `, [name, email, hash, role ?? "contributor"]);
    return rslt.rows[0];
  }
  async userLoginAuth(email, password) {
    const userDB = await pool.query(`
            SELECT * FROM users WHERE email = $1
            `, [email]);
    const user_db = userDB?.rows[0];
    if (!user_db) {
      throw new Error("Invalid email");
    }
    const { password_hash, ...user } = user_db;
    const isvalidPass = await bcrypt.compare(password, password_hash);
    if (!isvalidPass) {
      throw new Error("Invalid Credential ");
    }
    const jwtpayload = {
      id: user_db.id,
      name: user_db.name,
      role: user_db.role
    };
    const { accessToken, refreshToken } = jwt_default(jwtpayload);
    return { accessToken, refreshToken, user };
  }
};
var users_services_default = new AuthService();

// src/utility/sendResponse.ts
function sendResponse(res, statusCod, { message, data, error }) {
  res.status(statusCod).json({
    success: error ? false : true,
    message,
    data: error ? void 0 : data
  });
}

// src/module/users/users.Controller.ts
import "buffer";
var createUser = async (req, res) => {
  const user = await users_services_default.userCreateAuth(req.body);
  return sendResponse(res, 201, { message: "User registered successfully", data: user });
};
var loginUser = async (req, res) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken, user } = await users_services_default.userLoginAuth(email, password);
  return sendResponse(res, 201, { message: "Login successful", data: { accessToken, user } });
};
var authController = {
  createUser,
  loginUser
};

// src/module/users/users.router.ts
var router = Router();
router.post("/auth/signup", authController.createUser);
router.post("/auth/login", authController.loginUser);
var authRouter = router;

// src/module/issues/issues.router.ts
import { Router as Router2 } from "express";

// src/module/issues/issues.services.ts
var IssuesService = class {
  async issuesCreate(issuesInfo, currentUser) {
    const { title, description, type, status } = issuesInfo;
    if (!title || !description || !type) {
      throw new Error("Title, description and type are required");
    }
    const { id } = currentUser;
    const rslt = await pool.query(`
            INSERT INTO issues(title, description, type, status, reporter_id)
            VALUES($1, $2, $3, $4, $5)

            RETURNING *
            `, [title, description, type, status ?? "open", id]);
    return rslt.rows[0];
  }
  async issuesAllGet(quary, value) {
    const issues = await pool.query(quary, value);
    if (issues.rows.length === 0) {
      throw new Error("Issues not found");
    }
    const reporterIds = issues.rows.map((i) => i.reporter_id);
    const users = await pool.query(`
            SELECT id, name, role FROM users WHERE id = ANY($1)
            `, [reporterIds]);
    if (users.rows.length === 0) {
      throw new Error("User not found");
    }
    const result = issues.rows.map((issues2) => {
      const reporter = users.rows.find((u) => u.id === issues2.reporter_id);
      return {
        id: issues2.id,
        title: issues2.title,
        description: issues2.description,
        type: issues2.type,
        status: issues2.status,
        reporter,
        created_at: issues2.created_at,
        updated_at: issues2.updated_at
      };
    });
    return result;
  }
  async issuesSingleGet(id) {
    const issues_db = await pool.query(`SELECT * FROM issues WHERE id = $1`, [parseInt(id)]);
    const issues = issues_db.rows[0];
    if (!issues) {
      throw new Error("Issues not found");
    }
    const { reporter_id } = issues;
    const reporter_db = await pool.query(`SELECT id, name, role FROM users WHERE id = $1`, [reporter_id]);
    const reporter = reporter_db.rows[0];
    const result = {
      id: issues.id,
      title: issues.title,
      description: issues.description,
      type: issues.type,
      status: issues.status,
      reporter,
      created_at: issues.created_at,
      updated_at: issues.updated_at
    };
    return result;
  }
  async issuesUpdate(updateInfo, id) {
    const { title, description, type } = updateInfo;
    const updated_atNow = (/* @__PURE__ */ new Date()).toISOString();
    const issuesUpdate_db = await pool.query(`
            UPDATE issues 
            SET title = $1, description = $2, type = $3, updated_at=$4
            WHERE id = $5
            `, [title, description, type, updated_atNow, id]);
    if (!issuesUpdate_db.rowCount) {
      throw new Error("Failed to update issue");
    }
    const result = await pool.query(`SELECT * FROM issues WHERE id = $1`, [id]);
    return result.rows[0];
  }
  async issuesDelete(id) {
    const issueDelete = await pool.query(`
            DELETE FROM issues WHERE id = $1
            `, [id]);
    return issueDelete;
  }
};
var issues_services_default = new IssuesService();

// src/module/issues/issues.controller.ts
var createIssuse = async (req, res) => {
  const currentUser = req.currentUser;
  if (!currentUser) {
    sendResponse(res, 401, { message: "Unauthorized", error: true });
  }
  const issues = await issues_services_default.issuesCreate(req.body, currentUser);
  sendResponse(res, 201, { message: "Issue created successfully", data: issues });
};
var getAllIssues = async (req, res) => {
  const dataSort = ["newest", "oldest"];
  const dataType = ["bug", "feature_request"];
  const dataStatus = ["open", "in_progress", "resolved"];
  const { status, type, sort = "newest" } = req.query;
  if (type && !dataType.includes(type)) {
    return sendResponse(res, 400, { message: "invalid type value" });
  }
  if (status && !dataStatus.includes(status)) {
    return sendResponse(res, 400, { message: "invalid status value" });
  }
  if (sort && !dataSort.includes(sort)) {
    return sendResponse(res, 400, { message: "invalid sort value" });
  }
  let quary = `SELECT * FROM issues WHERE 1 = 1`;
  let values = [];
  if (type) {
    values.push(type);
    quary += ` AND type = $${values.length}`;
  }
  if (status) {
    values.push(status);
    quary += ` AND status = $${values.length}`;
  }
  if (sort === "oldest") {
    quary += ` ORDER BY created_at ASC`;
  }
  if (sort === "newest") {
    quary += ` ORDER BY created_at DESC`;
  }
  const issues = await issues_services_default.issuesAllGet(quary, values);
  sendResponse(res, 200, { data: issues });
};
var getSingleIssues = async (req, res) => {
  const id = req.params.id;
  const issues = await issues_services_default.issuesSingleGet(id);
  sendResponse(res, 200, { data: issues });
};
var updateIssues = async (req, res) => {
  const id = req.params.id;
  const issues = await issues_services_default.issuesUpdate(req.body, id);
  sendResponse(res, 200, { data: issues });
};
var deleteIssues = async (req, res) => {
  const id = req.params.id;
  const issues = await issues_services_default.issuesDelete(id);
  if (!issues.rowCount) {
    sendResponse(res, 404, { message: "Issue doesn't  deleted ", error: true });
  }
  sendResponse(res, 200, { message: "Issue deleted successfully" });
};
var issuesController = {
  createIssuse,
  getAllIssues,
  getSingleIssues,
  updateIssues,
  deleteIssues
};

// src/utility/tokenVerify.ts
import jwt2 from "jsonwebtoken";
var tokenVerify = (token, type) => {
  if (!token) {
    throw new Error("Authentication token required");
  }
  const secret = type === "access" ? index_config_default.access_secret : index_config_default.refresh_secret;
  return jwt2.verify(token, secret);
};
var tokenVerify_default = tokenVerify;

// src/middleware/auth.ts
var auth = () => {
  return async (req, res, next) => {
    const token = req.headers.authorization;
    const validToken = tokenVerify_default(token, "access");
    const user = await pool.query(`SELECT id,name,role FROM users WHERE id = $1`, [validToken.id]);
    if (user.rows.length === 0) {
      return sendResponse(res, 404, { message: "user not found", error: true });
    }
    req.currentUser = user.rows[0];
    next();
  };
};
var auth_default = auth;

// src/middleware/rolePermission.ts
var rolePermission = () => {
  return async (req, res, next) => {
    const id = req.params.id;
    const currentUser = req.currentUser;
    const issues = await pool.query(`SELECT reporter_id,status FROM issues WHERE id = $1`, [id]);
    const isIssues = issues.rows[0];
    console.log(isIssues);
    console.log(currentUser.id);
    if (!currentUser) {
      return sendResponse(res, 401, { message: "Unauthorized user", error: true });
    } else if (issues.rows.length === 0) {
      return sendResponse(res, 404, { message: "Issues not found", error: true });
    } else if (currentUser.role === "contributor" && currentUser.id === isIssues.reporter_id && isIssues.status === "open") {
      return next();
    } else if (currentUser.role === "maintainer") {
      return next();
    }
    return sendResponse(res, 401, { message: "You are not allowed to modify and delete this issue", error: true });
  };
};
var rolePermission_default = rolePermission;

// src/middleware/notDelete.ts
var notDelete = () => {
  return async (req, res, next) => {
    const currentUser = req.currentUser;
    if (!currentUser) {
      return sendResponse(res, 404, { message: "Unauthorized", error: true });
    } else if (currentUser.role === "contributor") {
      return sendResponse(res, 403, { message: "Unauthorized permission for Delete Issues", error: true });
    }
    next();
  };
};
var notDelete_default = notDelete;

// src/module/issues/issues.router.ts
var router2 = Router2();
router2.post("/issues", auth_default(), issuesController.createIssuse);
router2.get("/issues", issuesController.getAllIssues);
router2.get("/issues/:id", issuesController.getSingleIssues);
router2.put("/issues/:id", auth_default(), rolePermission_default(), issuesController.updateIssues);
router2.delete("/issues/:id", auth_default(), rolePermission_default(), notDelete_default(), issuesController.deleteIssues);
var issuesRouter = router2;

// src/middleware/globalError.ts
var globalError = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: index_config_default.project_type === "development" ? err.stack : ""
  });
};
var globalError_default = globalError;

// src/app.ts
import cookieParser from "cookie-parser";
var app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api", authRouter);
app.use("/api", issuesRouter);
app.get("/", (req, res) => {
  res.status(200).json({ message: "The DevPulseA server is start " });
});
app.use(globalError_default);
var app_default = app;

// src/server.ts
var main = () => {
  app_default.listen(index_config_default.port, () => {
    console.log(`Server runing on http://localhost:${index_config_default.port}/`);
  });
  initDB();
};
main();
//# sourceMappingURL=server.js.map