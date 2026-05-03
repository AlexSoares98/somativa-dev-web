import React, { Component } from "react";
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";

class Cadastro extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      senha: "",
      nome: "",
      sobrenome: "",
      nascimento: "",
      erros: {},
      mensagem: "",
      tipoMensagem: "",
      carregando: false
    };

    this.atualizarCampo = this.atualizarCampo.bind(this);
    this.formatarDataNascimento = this.formatarDataNascimento.bind(this);
    this.cadastrar = this.cadastrar.bind(this);
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

  formatarDataNascimento(event) {
    let valor = event.target.value;

    valor = valor.replace(/\D/g, "");

    if (valor.length > 8) {
      valor = valor.slice(0, 8);
    }

    if (valor.length > 4) {
      valor = valor.replace(/^(\d{2})(\d{2})(\d{1,4}).*/, "$1/$2/$3");
    } else if (valor.length > 2) {
      valor = valor.replace(/^(\d{2})(\d{1,2}).*/, "$1/$2");
    }

    this.setState((prevState) => ({
      nascimento: valor,
      mensagem: "",
      tipoMensagem: "",
      erros: {
        ...prevState.erros,
        nascimento: ""
      }
    }));
  }

  validarCampos() {
    const { email, senha, nome, sobrenome, nascimento } = this.state;
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

    if (!nome.trim()) {
      erros.nome = "Informe seu nome.";
    } else if (nome.trim().length < 2) {
      erros.nome = "O nome deve ter pelo menos 2 caracteres.";
    }

    if (!sobrenome.trim()) {
      erros.sobrenome = "Informe seu sobrenome.";
    } else if (sobrenome.trim().length < 2) {
      erros.sobrenome = "O sobrenome deve ter pelo menos 2 caracteres.";
    }

    if (!nascimento.trim()) {
      erros.nascimento = "Informe sua data de nascimento.";
    } else if (
      !/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(nascimento)
    ) {
      erros.nascimento = "Use o formato dd/mm/aaaa.";
    }

    return erros;
  }

  async cadastrar(event) {
    event.preventDefault();

    const erros = this.validarCampos();

    if (Object.keys(erros).length > 0) {
      this.setState({
        erros,
        mensagem: "Corrija os campos obrigatórios antes de continuar.",
        tipoMensagem: "erro"
      });
      return;
    }

    const { email, senha, nome, sobrenome, nascimento } = this.state;

    this.setState({
      carregando: true,
      mensagem: "",
      tipoMensagem: ""
    });

    try {
      const credencial = await createUserWithEmailAndPassword(auth, email, senha);

      await setDoc(doc(db, "usuarios", credencial.user.uid), {
        uid: credencial.user.uid,
        email: email,
        nome: nome,
        sobrenome: sobrenome,
        nascimento: nascimento,
        criadoEm: serverTimestamp()
      });

      await signOut(auth);

      this.setState({
        email: "",
        senha: "",
        nome: "",
        sobrenome: "",
        nascimento: "",
        erros: {},
        mensagem: "Cadastro realizado com sucesso. Faça login para acessar a área do aluno.",
        tipoMensagem: "sucesso",
        carregando: false
      });
    } catch (error) {
      let mensagemErro = "Não foi possível concluir o cadastro! Tente novamente.";

      if (error.code === "auth/email-already-in-use") {
        mensagemErro = "Este e-mail já está cadastrado. Faça login ou use outro endereço.";
      } else if (error.code === "auth/invalid-email") {
        mensagemErro = "Digite um e-mail válido. (Exemplo: nome@dominio.com)";
      } else if (error.code === "auth/weak-password") {
        mensagemErro = "A senha é muito fraca. Use pelo menos 6 caracteres.";
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
      nome,
      sobrenome,
      nascimento,
      erros,
      mensagem,
      tipoMensagem,
      carregando
    } = this.state;

    return (
      <div className="page-wrapper">
        <div className="auth-card">
          <h1 className="auth-title">Cadastro</h1>
          <p className="auth-subtitle">
            Crie sua conta para acessar a área do Aluno.
          </p>
          <form onSubmit={this.cadastrar} noValidate>
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

            <div className="form-group">
              <input
                id="nome"
                name="nome"
                type="text"
                placeholder="Nome"
                value={nome}
                onChange={this.atualizarCampo}
                className={erros.nome ? "input-error" : ""}
              />
              {erros.nome && <span className="field-error">{erros.nome}</span>}
            </div>

            <div className="form-group">
              <input
                id="sobrenome"
                name="sobrenome"
                type="text"
                placeholder="Sobrenome"
                value={sobrenome}
                onChange={this.atualizarCampo}
                className={erros.sobrenome ? "input-error" : ""}
              />
              {erros.sobrenome && (
                <span className="field-error">{erros.sobrenome}</span>
              )}
            </div>

            <div className="form-group">
              <input
                id="nascimento"
                name="nascimento"
                type="text"
                placeholder="Data de nascimento (dd/mm/aaaa)"
                value={nascimento}
                onChange={this.formatarDataNascimento}
                maxLength="10"
                inputMode="numeric"
                className={erros.nascimento ? "input-error" : ""}
              />
              {erros.nascimento && (
                <span className="field-error">{erros.nascimento}</span>
              )}
            </div>

            <button type="submit" className="primary-button" disabled={carregando}>
              {carregando ? "Cadastrando..." : "Cadastrar"}
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
              Já possui conta? <Link to="/login">Voltar para Login</Link>
            </p>
          </form>
        </div>
      </div>
    );
  }
}

export default Cadastro;