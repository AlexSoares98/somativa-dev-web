import React, { Component } from "react";
import { Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      senha: "",
      erros: {},
      mensagem: "",
      tipoMensagem: "",
      carregando: false,
      redirecionar: false
    };

    this.atualizarCampo = this.atualizarCampo.bind(this);
    this.acessar = this.acessar.bind(this);
  }

  atualizarCampo(event) {
    const { name, value } = event.target;

    this.setState((prevState) => ({
      [name]: value,
      mensagem: "",
      tipoMensagem: "",
      erros: {
        ...prevState.erros,
        [name]: ""
      }
    }));
  }

  validarCampos() {
    const { email, senha } = this.state;
    const erros = {};

    if (!email.trim()) {
      erros.email = "Informe seu e-mail.";
    } else if (!email.includes("@")) {
      erros.email = "O e-mail deve conter @.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      erros.email = "Digite um e-mail válido. (Exemplo: nome@dominio.com)";
    }
    if (!senha.trim()) {
      erros.senha = "Informe sua senha.";
    } else if (senha.length < 6) {
      erros.senha = "A senha deve ter pelo menos 6 caracteres.";
    }

    return erros;
  }

  async acessar(event) {
    event.preventDefault();

    const erros = this.validarCampos();

    if (Object.keys(erros).length > 0) {
      this.setState({
        erros,
        mensagem: "Preencha corretamente os campos para continuar.",
        tipoMensagem: "erro"
      });
      return;
    }

    const { email, senha } = this.state;

    this.setState({
      carregando: true,
      mensagem: "",
      tipoMensagem: ""
    });

    try {
      await signInWithEmailAndPassword(auth, email, senha);

      this.setState({
        carregando: false,
        redirecionar: true
      });
    } catch (error) {
      let mensagemErro = "Usuário não cadastrado ou senha incorreta.";

      if (error.code === "auth/invalid-email") {
        mensagemErro = "Digite um e-mail válido. (Exemplo: nome@dominio.com)";
      } else if (error.code === "auth/user-not-found") {
        mensagemErro = "Nenhum usuário foi encontrado com este e-mail.";
      } else if (error.code === "auth/wrong-password") {
        mensagemErro = "A senha informada está incorreta.";
      } else if (error.code === "auth/invalid-credential") {
        mensagemErro = "E-mail ou senha inválidos. Verifique os dados e tente novamente.";
      }

      this.setState({
        mensagem: mensagemErro,
        tipoMensagem: "erro",
        carregando: false
      });
    }
  }

  render() {
    const {
      email,
      senha,
      erros,
      mensagem,
      tipoMensagem,
      carregando,
      redirecionar
    } = this.state;

    if (redirecionar) {
      this.props.history.push("/principal");
    }

    return (
      <div className="page-wrapper">
        <div className="auth-card">
          <h1 className="auth-title">Login</h1>
          <p className="auth-subtitle">
            Entre com seu e-mail e senha para acessar a área do Aluno.
          </p>
          <form onSubmit={this.acessar} noValidate>
            <div className="form-group">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={this.atualizarCampo}
                className={erros.email ? "input-error" : ""}
              />
              {erros.email && <span className="field-error">{erros.email}</span>}
            </div>

            <div className="form-group">
              <input
                id="senha"
                name="senha"
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={this.atualizarCampo}
                className={erros.senha ? "input-error" : ""}
              />
              {erros.senha && <span className="field-error">{erros.senha}</span>}
            </div>
            <button type="submit" className="primary-button" disabled={carregando}>
              {carregando ? "Entrando..." : "Acessar"}
            </button>

            {mensagem && (
              <div
                className={`status-message ${
                  tipoMensagem === "sucesso" ? "success" : "error"
                }`}
              >
                {mensagem}
              </div>
            )}
            <p className="bottom-text">
              Ainda não tem conta? <Link to="/cadastro">Criar cadastro</Link>
            </p>
          </form>
        </div>
      </div>
    );
  }
}

export default Login;