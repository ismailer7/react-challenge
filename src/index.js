import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./styles.css";

const TOTAL_PAGES = 34;
const DATE = "2019-02-10";
// const OAUTH_TOKEN = "0560ecbca7f1b7c02274b6b734b29e33b88e965f";
class App extends Component {
  constructor(probs) {
    super(probs);
    this.state = {
      currentPage: 1,
      pages: [1, 2, 3],
      offset: 0,
      fetchedData: []
    };
  }

  loadRepos = page => {
    // console.log(page);
    fetch(
      `https://api.github.com/search/repositories?q=created:%3E${DATE}&sort=stars&order=desc&page=${page}`
    )
      .then(response => response.json())
      .then(data => {
        // console.log(data.items);
        this.setState({
          fetchedData: data.items
        });
      })
      .catch(error => console.error(error));
  };

  componentDidMount() {
    let btnTop = document.querySelector(".top");
    window.addEventListener("scroll", () => {
      // console.log("scrolled ", window.scrollY);
      if (window.scrollY >= 300) {
        btnTop.classList.add("is-visible");
      } else {
        btnTop.classList.remove("is-visible");
      }
    });
    this.loadRepos(this.state.currentPage);
  }

  next = () => {
    // console.log("current page is : ", this.state.currentPage);
    // console.log("pages : ", this.state.pages);
    if (this.state.currentPage === this.state.pages.length) {
      let copyPages = [...this.state.pages];
      const lastElement = copyPages[copyPages.length - 1];
      copyPages.push(lastElement + 1);
      this.setState({
        currentPage: this.state.currentPage + 1,
        pages: copyPages,
        offset: this.state.offset + 1,
        fetchedData: []
      });
    } else {
      this.setState({
        currentPage: this.state.currentPage + 1,
        fetchedData: []
      });
    }
    this.TopscrollTo();
    this.loadRepos(this.state.currentPage);
    // back to top
  };

  previous = () => {
    // console.log("array : ", this.state.pages);
    // console.log("offset : ", this.state.offset);
    if (this.state.currentPage === this.state.pages[this.state.offset]) {
      let copyPages = [...this.state.pages];
      copyPages.pop();
      this.setState({
        currentPage: this.state.currentPage - 1,
        pages: copyPages,
        offset: this.state.offset - 1,
        fetchedData: []
      });
    } else {
      this.setState({
        currentPage: this.state.currentPage - 1,
        fetchedData: []
      });
    }
    this.loadRepos(this.state.currentPage);
    // back to top
    this.TopscrollTo();
  };

  movePage = event => {
    /* 
    console.log("clicked on : ", event.target.dataset.index);
    console.log("currentPage : ", this.state.currentPage);
    console.log("offset : ", this.state.offset);
    console.log("pages : ", this.state.pages);
    */
    this.setState({
      currentPage: parseInt(event.target.dataset.index),
      fetchedData: []
    });
    this.loadRepos(event.target.dataset.index);
    // back to top
    this.TopscrollTo();
  };

  getDateInterval = createAt => {
    let createdAtDate = new Date(createAt);
    return this.toDays(Math.abs(new Date(DATE) - createdAtDate));
  };

  toDays = milliseconds => {
    return Math.round(milliseconds / (1000 * 60 * 60 * 24));
  };

  TopscrollTo = () => {
    if (window.scrollY !== 0) {
      setTimeout(() => {
        window.scrollTo(0, window.scrollY - 30);
        this.TopscrollTo();
      }, 5);
    }
  };

  deleteItem = event => {
    const index = event.target.dataset.index;
    const copyList = [...this.state.fetchedData];
    copyList.splice(index, 1);
    this.setState({
      fetchedData: copyList
    });
  };

  render() {
    let pageList = this.state.pages.map((elm, index) => {
      return (
        <a
          href="#"
          key={index}
          className={
            this.state.currentPage === index + 1
              ? "page-link text-light focus"
              : "page-link"
          }
          data-index={index + 1}
          onClick={this.movePage}
        >
          {elm}
        </a>
      );
    });
    let dataList = this.state.fetchedData.map((elm, index) => {
      return (
        <li key={index}>
          <div class="card mb-3">
            <button
              className="deleteItem"
              data-index={index}
              onClick={this.deleteItem}
            >
              {" "}
              X{" "}
            </button>
            <div class="row">
              <div class="col-md-3">
                <img src={elm.owner.avatar_url} class="card-img" alt="..." />
              </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h5 class="card-title">{elm.name}</h5>
                  <p class="card-text">{elm.description}</p>
                  <p class="card-text">
                    <small class="text-muted info">
                      NbStars : {elm.stargazers_count}
                    </small>
                    <small class="text-muted info">
                      NbIssues : {elm.open_issues}
                    </small>
                    <small class="text-muted">
                      Submitted {this.getDateInterval(elm.created_at)} days ago
                      by {elm.owner.login}
                    </small>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </li>
      );
    });

    return (
      <div>
        <h1>Pagination example</h1>
        <ul className={this.state.fetchedData.length > 0 ? "" : "loader"}>
          {dataList}
        </ul>
        <nav
          aria-label="Page navigation example"
          className={
            this.state.fetchedData.length > 0
              ? "paginator"
              : "hidePaginator paginator"
          }
        >
          <ul className="pagination">
            <li
              className={
                this.state.currentPage === 1
                  ? "disabled page-item"
                  : "page-item"
              }
              onClick={this.previous}
            >
              <a href="#" className="page-link">
                &lt;
              </a>
            </li>
            {pageList.slice(this.state.offset, this.state.pages.length + 2)}
            <li
              className={
                this.state.currentPage === TOTAL_PAGES
                  ? "hide page-item"
                  : "page-item"
              }
              onClick={this.next}
            >
              <a href="#" className="page-link">
                &gt;
              </a>
            </li>
          </ul>
        </nav>
        <button className="top" onClick={this.TopscrollTo}>
          <i className="fas fa-arrow-up white-icon" />
        </button>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
