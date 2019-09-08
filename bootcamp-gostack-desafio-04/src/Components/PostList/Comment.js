import React, { Component } from 'react';

class Comment extends Component {
  state = {};

  render() {
    const { data } = this.props;

    return (
      <section id="comments">
        <div className="image-wrapper">
          <img src={data.author.avatar} alt="Avatar" />
        </div>
        <div className="comment">
          <h6>
            {data.author.name} <span>{data.content}</span>
          </h6>
        </div>
      </section>
    );
  }
}

export default Comment;
