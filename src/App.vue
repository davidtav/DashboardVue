<template>
  <div class="container">
    <header>
      <h1>Aplicações Diárias</h1>
      <div class="search-bar">
        <input type="text" v-model="newLink" placeholder="insira o link aqui" @keyup.enter="addLink" />
        <button @click="addLink" :disabled="isLoading">
          {{ isLoading ? 'Inserindo...' : 'Inserir' }}
        </button>
      </div>
    </header>

    <main>
      <hr>
      <div class="cards-container">
        <div v-for="link in links" :key="link.id" class="card">
          <img :src="link.logo" :alt="getFaviconDomain(link.url)" class="card-logo" />
          <div>
            <a :href="link.url" target="_blank" class="card-link">
              {{ getFaviconDomain(link.url) }}
            </a>
          </div>
          <div class="card-actions">
            <button @click="editLink(link)">Editar</button>
            <button @click="deleteLink(link.id)">Excluir</button>
          </div>
        </div>
      </div>
    </main>

    <footer>
      <p v-if="error" class="error">{{ error }}</p>
    </footer>
  </div>
  <footer id="footer">
    <p>Desenvolvido por <a href="https://github.com/davidtav">David Tavares</a></p>  
    
  </footer>
</template>

<script>
export default {
  data() {
    return {
      newLink: '',
      links: [],
      isLoading: false,
      error: null,
      editingLink: null
    }
  },

  methods: {
    getFaviconUrl(url) {
      try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      } catch (error) {
        console.error('URL inválida:', error);
        return '';
      }
    },

    getFaviconDomain(url) {
      try {
        return new URL(url).hostname;
      } catch (error) {
        return url;
      }
    },

    async addLink() {
      if (!this.newLink) {
        this.error = 'Por favor, insira um link válido';
        return;
      }

      try {
        this.isLoading = true;
        this.error = null;

        // Obtém o favicon do site
        const logo = this.getFaviconUrl(this.newLink);

        // Envia para o backend
        const response = await fetch('http://localhost:5000/links', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: this.newLink,
            logo: logo
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao adicionar link');
        }

        // Limpa o input e recarrega os links
        this.newLink = '';
        await this.loadLinks();

      } catch (error) {
        this.error = 'Erro ao adicionar link: ' + error.message;
        console.error('Erro:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async loadLinks() {
      try {
        const response = await fetch('http://localhost:5000/links');
        if (!response.ok) {
          throw new Error('Erro ao carregar links');
        }
        this.links = await response.json();
      } catch (error) {
        this.error = 'Erro ao carregar links: ' + error.message;
        console.error('Erro:', error);
      }
    },

    async deleteLink(id) {
      try {
        const response = await fetch(`http://localhost:5000/links/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Erro ao excluir link');
        }

        await this.loadLinks();
      } catch (error) {
        this.error = 'Erro ao excluir link: ' + error.message;
        console.error('Erro:', error);
      }
    },

    editLink(link) {
      this.editingLink = link;
      this.newLink = link.url;
    },

    async updateLink() {
      if (!this.newLink) {
        this.error = 'Por favor, insira um link válido';
        return;
      }

      try {
        this.isLoading = true;
        this.error = null;

        // Obtém o favicon do site
        const logo = this.getFaviconUrl(this.newLink);

        // Envia para o backend
        const response = await fetch(`http://localhost:5000/links/${this.editingLink.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: this.newLink,
            logo: logo
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao atualizar link');
        }

        // Limpa o input e recarrega os links
        this.newLink = '';
        this.editingLink = null;
        await this.loadLinks();

      } catch (error) {
        this.error = 'Erro ao atualizar link: ' + error.message;
        console.error('Erro:', error);
      } finally {
        this.isLoading = false;
      }
    }
  },

  mounted() {
    this.loadLinks();
  }
}
</script>

<style scoped>
.card-actions {
  margin-top: 10px;
}

.card-actions button {
  margin-right: 5px;
  padding: 5px 10px;
  cursor: pointer;
}
.error {
  color: red;
  margin-top: 10px;
}

body {
  font-family: Arial, sans-serif;
  margin: 100px;
  padding: 0;
  background-color: #f1f1f1;
}

.container {
  max-width: 900px;
  max-height: max-content;
  margin: 0 auto;
  margin-top: 200px;
  background-color: #ffffff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

header {
  text-align: center;
  margin-bottom: 20px;
}

header h1 {
  font-size: 2.5em;
  color: #598b64;
}

.search-bar {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.search-bar input {
  width: 70%;
  padding: 10px;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.search-bar button {
  padding: 10px 20px;
  font-size: 1em;
  background-color: #4285f4;
  color: #fff;
  border: none;
  border-radius: 4px;
  margin-left: 10px;
  cursor: pointer;
}

main {
  margin-top: 20px;
  
}

.add-link-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.add-link-form input {
  padding: 10px;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.add-link-form button {
  padding: 10px;
  font-size: 1em;
  background-color: #34a853;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.card {
  margin-top: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  text-align: center;
  background-color: #f9f9f9;
}

.card-logo {
  width: 50px;
  height: 50px;
  margin-bottom: 10px;
}

.card-link {

  text-decoration: none;
  color: #4285f4;
  font-size: 0.9em;
  justify-content: center;
}

footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 10px;
}

footer p {
  font-size: 1.2em;
  color: #34a853;
}

footer button {
  padding: 10px 20px;
  font-size: 1em;
  background-color: #34a853;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
#footer {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  background-color: rgba(186, 215, 223, 0.726);
  color: black;
  text-align: center;
}
</style>