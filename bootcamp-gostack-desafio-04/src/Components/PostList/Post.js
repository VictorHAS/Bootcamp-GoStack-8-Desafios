import React, { Component } from 'react';

import Comment from './Comment';

class Post extends Component {
  state = {};

  render() {
    const { data } = this.props;
    return (
      <div id="card">
        <div className="infos">
          <img src={data.author.avatar} alt="Avatar" />
          <div className="texto">
            <h6>{data.author.name}</h6>
            <span>{data.date}</span>
          </div>
        </div>
        <span>{data.content}</span>
        <hr></hr>
        {data.comments.map(comment => (
          <Comment key={comment.id} data={comment} />
        ))}
      </div>
    );
  }
}

export default Post;
