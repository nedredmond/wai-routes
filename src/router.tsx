import React from "react";
import type { RouteObject } from "react-router-dom";
import { RouterProvider, createHashRouter } from "react-router-dom";
import type { WcagResponseData } from "./types";
import { pathAliases } from "./types";
import { WcagContext } from "./wcag/wcagContext";
import loader from "./loader";
import { parse } from "./utils";
import { Text } from "./components/text";

const wcagRoutes = (wcag: WcagResponseData) =>
  wcag.principles
    .map((principle): RouteObject[] =>
      pathAliases.map((pKey) => ({
        path: `wcag/${parse(principle[pKey])}`,
        loader: () => loader(principle),
        children: principle.guidelines
          .map((guideline): RouteObject[] =>
            pathAliases.map((gKey) => ({
              path: `wcag/${parse(principle[pKey])}/${parse(guideline[gKey])}`,
              loader: () => loader(guideline),
              children: guideline.successcriteria
                .map((successcriterion): RouteObject[] =>
                  pathAliases.map((scKey) => ({
                    path: `wcag/${parse(principle[pKey])}/${parse(
                      guideline[gKey],
                    )}/${parse(successcriterion[scKey])}`,
                    loader: () => loader(successcriterion),
                  })),
                )
                .flat(),
            })),
          )
          .flat(),
      })),
    )
    .flat();

const router = (data: WcagResponseData) =>
  createHashRouter([
    {
      path: "/",
      element: (
        <Text>
          Add the spec to the URL like so: <code>/#/wcag/1</code> to go to the
          first principal, or <code>/#/wcag/1/1/1</code> to go to the first
          success criterion. <br /> You can also use the names of principles,
          guidelines, and criteria, like so:
          <code> /#/wcag/robust/compatible/name-role-value</code>
        </Text>
      ),
    },
    ...wcagRoutes(data),
    {
      path: "/*",
      element: <Text>WCAG spec not found!</Text>,
    },
  ]);

const Router = () => (
  <WcagContext.Consumer>
    {({ loading, data }) => {
      if (loading) {
        return <Text>Loading WCAG spec...</Text>;
      }
      if (!data) {
        return <Text>Something went wrong!</Text>;
      }
      console.log("router", router(data).routes);
      return <RouterProvider router={router(data)} />;
    }}
  </WcagContext.Consumer>
);

export default Router;
