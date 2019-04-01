import React, { Component } from 'react';
import './App.css';

const TOTAL_PAGES = 34;
const DATE = "2019-02-10";
// const OAUTH_TOKEN = "0560ecbca7f1b7c02274b6b734b29e33b88e965f";
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
      pages: [1, 2, 3], // initial pages to displays
      offset: 0,
      fetchedData: []
    };
  }
  // loading data from github api base on which page we are currently on.
  loadRepos = page => {
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
    const btnTop = document.querySelector(".top");
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

  // next button callback
  next = () => {
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
    this.loadRepos(this.state.currentPage + 1);
    // back to top
    this.backToTop(); 
  };

  // previous callback
  previous = () => {
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
    this.loadRepos(this.state.currentPage - 1);
    // back to top
    this.backToTop();
  };
  // move to specific page
  movePage = event => {
    this.setState({
      currentPage: parseInt(event.target.dataset.index),
      fetchedData: []
    });
    this.loadRepos(parseInt(event.target.dataset.index));
    // back to top
    this.backToTop();
  };
  
  // get the date difference in milliseconds (repository created date - date on api call)
  getDateInterval = createAt => {
    let createdAtDate = new Date(createAt);
    return this.toDays(Math.abs(new Date(DATE) - createdAtDate));
  };
  
  // convert milliseconds to days
  toDays = milliseconds => {
    return Math.round(milliseconds / (1000 * 60 * 60 * 24));
  };

  // scroll back to top
  backToTop = () => {
    if (window.scrollY !== 0) {
      setTimeout(() => {
        window.scrollTo(0, window.scrollY - 30);
        this.backToTop(); // call it back until we reach the top
      }, 5);
    }
  };

  // delete a repository.
  deleteItem = event => {
    const index = event.target.dataset.index; // get the index from data-index
    const copyList = [...this.state.fetchedData];
    copyList.splice(index, 1);
    this.setState({
      fetchedData: copyList
    });
  };

  render() {
    let pageList = this.state.pages.map((elm, index) => {
      return (
        <button
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
        </button>
      );
    });
    let dataList = this.state.fetchedData.map((elm, index) => {
      return (
        <li key={index}>
          <div className="card mb-3">
            <button
              className="deleteItem"
              data-index={index}
              onClick={this.deleteItem}
            >
              {" "}
              X{" "}
            </button>
            <div className="row">
              <div className="col-md-3">
                <img
                  src={elm.owner.avatar_url}
                  className="card-img"
                  alt="..."
                />
              </div>
              <div className="col-md-8">
                <div className="card-body">
                  <h5 className="card-title">{elm.name}</h5>
                  <p className="card-text">{elm.description}</p>
                  <p className="card-text">
                    <small className="text-muted info">
                      NbStars : {elm.stargazers_count}
                    </small>
                    <small className="text-muted info">
                      NbIssues : {elm.open_issues}
                    </small>
                    <small className="text-muted">
                      Submitted {this.getDateInterval(elm.created_at)} days ago
                      by {elm.owner.login}.
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
        <h1>Front-End Challenge</h1>
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
                  ? "hide page-item"
                  : "page-item"
              }
              onClick={this.previous}
            >
              <button className="page-link">
                &lt;
              </button>
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
              <button className="page-link">
                &gt;
              </button>
            </li>
          </ul>
        </nav>
        <button className="top" onClick={this.backToTop}>
          <i class="fas fa-chevron-up white-icon"></i>
        </button>
      </div>
    );
  }
}

export default App;
