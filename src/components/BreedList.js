import React, { Component } from 'react';

class BreedList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      breeds: [],
      breed: null,
      subBreed: null,
      photos: null,
      photosHold: null,
    };
    this.handleClick = this.handleClick.bind(this);
  }

  // clear breed selections which returns view to breeds list buttons
  resetState = () => {
    this.setState({
      isLoaded: true,
      breed: null,
      subBreed: null
    });
  }

  // on component mount, we get the breeds list and display them as buttons
  componentDidMount() {
    fetch("https://dog.ceo/api/breeds/list/all")
      .then(res => res.json())
      .then(
        (result) => {
          if (result.status !== "success") {
            console.log('not success')
            this.setState({
              isLoaded: true,
              error: true
            });
          } else {
            // this is not a fetch error, but an error from the API
            console.log(result);
            this.setState({
              isLoaded: true,
              breeds: result.message
            });
          }
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      );
  }

  // calls api with breedname and returns array of pic urls for breed
  getBreedPic = (breed = this.state.breed, subBreed = this.state.subBreed, callback) => {
    fetch("https://dog.ceo/api/breed/" + breed + "/images")
      .then(res => res.json())
      .then(
        (result) => {
          if (result.status !== "success") {
            // we got a response, but it was not successful
            console.log('not successful')
            this.setState({
              isLoaded: true,
              error: true
            });
          } else {
            this.setState({
              isLoaded: true,
              photos: result.message
            });
          }
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error: true
          });
        }
      )
  }

  // takes array of breed pics and reduces it to only selected sub-breed, i.e setter to setter-irish
  filterToSubBreed = (a) => {
    if (this.state.breed.match(/\-/)) {
      let newArray = a.map((v) => {
        if (v.match(this.state.breed)) return v;
      });
      return newArray;
    }
    return a;
  }

  // This renders a single breed for our list
  renderBreed(breed, subBreed, callback, i) {
    let pref = (subBreed.length === 1) ? subBreed[0] + ' ' : '';
    return (
      <button className="breed" key={i} onClick={callback.bind(this, [breed, subBreed])}>
        {pref}{breed}
      </button>
    );
  }

  getSubBreedLink = (b, o, i) => {
    // little closure to handle click state of sub-breed link.
    let setSubBreedSelection = (o) => {
      this.setState({ breed: this.state.breed.replace(/\-.*$/, '') + '-' + o });
      this.getBreedPic();
    }
    return (
      <button className="breed" key={i} onClick={setSubBreedSelection.bind(o)}>{o}</button>
    );
  }

  // handles the breed list clicks and returns the photo and sub breeds if they exist
  handleClick(d, e) {
    let b = d[0];
    let sb = d[1];
    this.setState({
      breed: b,
      subBreed: sb,
      isLoaded: false
    });
    this.getBreedPic(b, sb);
  }

  render() {
    const { error, isLoaded, breeds } = this.state;
    const renderBreed = this.renderBreed;
   
    if (error) {  // handle doggie errors
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) { // we're still waiting on ajax puppies
      if (this.state.breed) {
        // customize loading message to the selected breed
        let a_an = (this.state.breed.match(/^(a|e|i|o|u)/i)) ? 'an' : 'a';
        return <div>Loading a photo of {a_an} {this.state.breed} for your viewing pleasure...</div>;
      } else {
        return <div>Loading...</div>;
      }
    } else { // ok ... we have data.  Do stuff with it.  Dogs!
      
      if (this.state.breed) {  // someone clicked on a breed.  Give them the pooch they asked for!
        let breed = this.state.breed;
        let pics = this.filterToSubBreed(this.state.photos);
        // grab random pic from array  TODO: prevent repeats.
        let pic = pics[Math.floor(Math.random() * Math.floor(pics.length))];
        let subbrs = this.state.subBreed || [];
        let callback = this.resetState;
        // small closure to handle the request for another photo of the breed.
        let refresh = () => { this.setState({isLoaded: false }); this.getBreedPic(); }
        let subbreedcallback = this.handleClick;
        let getSubBreedLink = this.getSubBreedLink;
        // take our breed, split on the - and reverse.  If it's sub breed we end up with ['irish','setter'], else ['setter']
        var brd = breed.split('-').reverse();
        if (brd.length > 1) { // we know we have a sub-breed here
          return (
            <div>
              <div className="button-nav">
                <button className="button-back" onClick={callback}>Back to That Dog List!</button>
                <button className="button-refresh" onClick={refresh}>Show a different {brd[0]} {brd[1]}!</button>
              </div>
              <div id="breedpic">
                <img src={pic} />
              </div>
            </div>
          );
        } else { // this is a main breed
          // handle quirk with breed, then single sub-breed by adding sub-breed as prefix (i.e., norwegian elkhound)
          let prefix = (subbrs.length === 1) ? subbrs[0]+' ' : ''
          return (
            <div>
              <div className="button-nav">
                <button className="button-back" onClick={callback}>Back to That Dog List!</button>
                <button className="button-refresh" onClick={refresh}>Show a different {prefix}{brd[0]}!</button>
                { subbrs.map(function (sb, i) {
                  if (brd.length > 1) { // a sub breed was selected.  Show ONLY that sub
                    if (i===0) return renderBreed(brd+'-'+sb, subbrs, subbreedcallback, i);
                  } else { // this is a main breed selection with sub-breeds.  only display if there are more than one
                    if (subbrs.length > 1) return renderBreed(brd[0]+'-'+sb, subbrs, subbreedcallback, i);
                  }
                })};
              </div>
              <div id="breedpic">
                <img src={pic} />
              </div>
            </div>
          );
        }
      }
      // if we get here, no selection has been made.  Give the full breeds list as buttons.
      let breedNames = Object.keys(breeds);
      breedNames.sort();
      let callback = this.handleClick;
      return (
        <div id="breedNameList">
          {breedNames.map(function (object, i) {
            return renderBreed(object, breeds[object], callback, i);
          })}
        </div>
      );
    }
  }
}

export default BreedList;
