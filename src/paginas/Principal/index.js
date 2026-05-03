import React, { Component } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

class Principal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nome: "",
      sobrenome: "",
      nascimento: "",
      email: "",
      carregando: true,
      mensagem: "",
      tipoMensagem: "",
      autenticado: true
    };

    this.fazerLogout = this.fazerLogout.bind(this);
  }

  componentDidMount() {
    this.unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        this.setState({
          carregando: false,
          autenticado: false,
          mensagem: "Você precisa estar logado para acessar a página do aluno.",
          tipoMensagem: "erro"
        });
        return;
      }
      try {
        const docRef = doc(db, "usuarios", usuario.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const dados = docSnap.data();

          this.setState({
            nome: dados.nome || "",
            sobrenome: dados.sobrenome || "",
            nascimento: dados.nascimento || "",
            email: dados.email || usuario.email,
            carregando: false,
            autenticado: true
          });
        } else {
          this.setState({
            carregando: false,
            autenticado: true,
            mensagem:
              "Usuário autenticado, mas os dados não foram encontrados.",
            tipoMensagem: "erro"
          });
        }
      } catch (error) {
        this.setState({
          carregando: false,
          autenticado: true,
          mensagem: "Não foi possível carregar os dados do aluno.",
          tipoMensagem: "erro"
        });
      }
    });
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  async fazerLogout() {
    try {
      await signOut(auth);
      this.props.history.push("/login");
    } catch (error) {
      this.setState({
        mensagem: "Não foi possível encerrar a sessão.",
        tipoMensagem: "erro"
      });
    }
  }

  render() {
    const {
      nome,
      sobrenome,
      nascimento,
      email,
      carregando,
      mensagem,
      tipoMensagem,
      autenticado
    } = this.state;

    if (carregando) {
      return (
        <div className="page-wrapper">
          <div className="auth-card">
            <h1 className="auth-title">Principal</h1>
            <div className="status-message info">
              Carregando dados do aluno...
            </div>
          </div>
        </div>
      );
    }

    if (!autenticado) {
      return (
        <div className="page-wrapper">
          <div className="auth-card">
            <h1 className="auth-title">Acesso restrito</h1>
            <div className="status-message error">{mensagem}</div>
            <p className="bottom-text">
              <Link to="/login">Ir para login</Link>
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="page-wrapper">
        <div className="auth-card dashboard-card">
          <h1 className="auth-title">Principal</h1>
          <p className="auth-subtitle">
            Estes são os dados cadastrados do usuário.
          </p>

          {mensagem && (
            <div
              className={`status-message ${
                tipoMensagem === "sucesso" ? "success" : "error"
              }`}
            >
              {mensagem}
            </div>
          )}

          <div className="profile-list">
            <div className="profile-item">
              <span className="profile-label">Nome</span>
              <span className="profile-value">{nome || "-"}</span>
            </div>

            <div className="profile-item">
              <span className="profile-label">Sobrenome</span>
              <span className="profile-value">{sobrenome || "-"}</span>
            </div>

            <div className="profile-item">
              <span className="profile-label">Data de nascimento</span>
              <span className="profile-value">{nascimento || "-"}</span>
            </div>

            <div className="profile-item">
              <span className="profile-label">E-mail</span>
              <span className="profile-value">{email || "-"}</span>
            </div>
          </div>

          <div className="button-group">
            <button className="primary-button" onClick={this.fazerLogout}>
              Sair
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Principal;