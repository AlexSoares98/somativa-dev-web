import React from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import Cadastro from "./paginas/Cadastro";
import Login from "./paginas/Login";
import Principal from "./paginas/Principal";

function Rotas() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>

        <Route exact path="/login" component={Login} />
        <Route exact path="/cadastro" component={Cadastro} />
        <Route exact path="/principal" component={Principal} />
      </Switch>
    </BrowserRouter>
  );
}

export default Rotas;