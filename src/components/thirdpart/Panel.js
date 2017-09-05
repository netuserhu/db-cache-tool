
import React, { Component } from 'react'

class Panel extends React.Component {

    render() {
        return (
            <div className='panel'>
                {this.props.children}
            </div>
        )
    }
}

class PanelHeader extends React.Component {
    render() {
        return (
            <div className='panel-hd'>
                {this.props.children}
            </div>
        )
    }
}

class PanelBody extends React.Component {

    render() {
        return (
            <div className='panel-bd'>
                {this.props.children}
            </div>
        )
    }
}

module.exports = {
    Panel,
    PanelHeader,
    PanelBody
}