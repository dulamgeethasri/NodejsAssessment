const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "products.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    productId: dbObject.product_id,
    productName: dbObject.product_name,
    productCategory: dbObject.product_category,
    imageUrl : dbObject.image_url,
    productDescription : dbObject.product_description
  };
};

// Create an api to create a product

app.post("/products/", async (request, response) => {
    const { productName,productCategory,imageUrl,productDescription } = request.body;
    const postProductQuery = `
    INSERT INTO
      product (product_name, product_category, image_url, product_description )
    VALUES
      ('${productName}', ${productCategory}, '${imageUrl}',${productDescription} );`;
    const product = await database.run(postProductQuery);
    response.send("Product Added to Team");
  });
  
  
// Create an api to fetch a product by product id

app.get("/products/:productId/", async (request, response) => {
  const { productId } = request.params;
  const getProductQuery = `
    SELECT 
      * 
    FROM 
      product 
    WHERE 
      product_id = ${productId};`;
  const product = await database.get(getProductQuery);
  response.send(convertDbObjectToResponseObject(product));
});


// Create an api to fetch all products with filters and pagination
//(eg: /products?page=1&pageSize=10&productName=apple&category=electronics)


app.get("/products/", async (request, response) => {
    const {
        offset = 1,
        limit = 5,
        order = "ASC",
        order_by = "product_id",
        search_q = "",
      } = request.query;
    const getProductsQuery = `
      SELECT
        *
      FROM
        product WHERE
        product_name LIKE '%${search_q}%'
       ORDER BY ${order_by} ${order}
       LIMIT ${limit} OFFSET ${offset};;`;
    const productsArray = await database.all(getProductsQuery);
    response.send(
      productsArray.map((eachProduct) =>
        convertDbObjectToResponseObject(eachProduct)
      )
    );
  });


  //Create an api to delete a product by id


app.delete("/products/:productId/", async (request, response) => {
  const { ProductId } = request.params;
  const deleteProductQuery = `
  DELETE FROM
    product
  WHERE
    product_id = ${productId};`;
  await database.run(deleteProductQuery);
  response.send("Product Removed");
});

module.exports = app;


