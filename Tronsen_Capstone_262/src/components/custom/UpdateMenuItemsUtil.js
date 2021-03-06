import React from 'react';
import TextField from '../TextField';
import OutputTable from '../OutputTable';
import $ from 'jquery';
import ReturnResult from '../ReturnResult';
import validator from 'validator';

export default class UpdateMenuItemsUtil extends React.Component {
  state = {
    dataArray: [],
    dataArrayHeaders: [],
    returnResultMessage: '',
    pollEnabled: true,
  };
  componentDidMount() {
    this.loadDataFromServer();
    setInterval(this.loadDataFromServer.bind(this), 10000);
  }
  updateDataOnServer(data) {
    $.ajax({
      url: '/backend/backendUpdateMenuData',
      dataType: 'json',
      type: 'PATCH',
      data,
      success: (data, status, xhr) => {
        console.log(status);

        this.setState(() => ({
          returnResultMessage: data.resMsg,
          pollEnabled: true,
          dataArray: [],
        }));
        this.loadDataFromServer();
      },
      error: (xhr, status, err) => {
        this.setState(() => ({
          returnResultMessage: err.resMsg,
          dataArray: [],
          dataArrayHeaders: [],
        }));
      },
    });
  }

  loadDataFromServer = () => {
    if (this.state.pollEnabled) {
      $.ajax({
        url: '/backend/backendLoadFullMenuData',
        dataType: 'json',
        type: 'GET',
        success: (data, status, xhr) => {
          console.log(status);
          this.setState(() => ({
            returnResultMessage: data.resMsg,
            dataArray: data.arrayData,
            dataArrayHeaders: data.arrayHeaderData,
          }));
        },
        error: (xhr, status, err) => {
          this.setState(() => ({
            returnResultMessage: err.resMsg,
            dataArray: [],
            dataArrayHeaders: [],
          }));
        },
      });
    }
  };

  handleSubmit = (values) => {
    const ID = values[0];
    const name = values[1];
    const description = values[2];
    const price = values[3];
    const entry_user = localStorage.getItem('user');

    if (!(ID || name || description || price || entry_user)) {
      this.setState(() => {
        return {
          returnResultMessage:
            'All fields are required, please fill in a value for the empty field before attempting resubmission.',
        };
      });
    } else if (!validator.isCurrency(price)) {
      this.setState(() => {
        return {
          returnResultMessage:
            'The price that you have entered is not valid. Please enter the amount in dollars without any currency symbols.',
        };
      });
    } else {
      this.updateDataOnServer({
        ID,
        name,
        description,
        price,
        entry_user,
      });
    }
  };

  disablePoll = () => {
    this.setState({ pollEnabled: false });
  };

  render() {
    return (
      <div>
        {this.state.returnResultMessage && (
          <ReturnResult returnResultMessage={this.state.returnResultMessage} />
        )}
        <UpdateMenuItemsForm
          dataArray={this.state.dataArray}
          dataArrayHeaders={this.state.dataArrayHeaders}
          disablePoll={this.disablePoll}
          handleSubmit={this.handleSubmit}
        />
      </div>
    );
  }
}
class UpdateMenuItemsForm extends React.Component {
  state = {
    ID: '',
    name: '',
    description: '',
    price: '',
  };
  componentDidMount() {}

  updateState = (field, value) => {
    this.setState(() => ({ [field]: value }));
  };
  outputSearchArray(matrix) {
    let newDataArray = matrix.slice();
    let searchedDisplayData = [];
    newDataArray.map((row) => {
      let arrayFromObj = [];
      for (let i = 0; i < this.props.dataArrayHeaders.length; i++) {
        arrayFromObj.push(row[this.props.dataArrayHeaders[i]].toString());
      }
      console.log(arrayFromObj);
      if (
        arrayFromObj[0].toLowerCase().includes(this.state.ID.toLowerCase()) &&
        arrayFromObj[1].toLowerCase().includes(this.state.name.toLowerCase()) &&
        arrayFromObj[2].toLowerCase().includes(this.state.description.toLowerCase()) &&
        arrayFromObj[3].toLowerCase().includes(this.state.price.toLowerCase()) 
      ) {
        searchedDisplayData.push(arrayFromObj);
      }
    });
    return searchedDisplayData;
  }

  handleUpdate = (e) => {
    e.preventDefault();
    this.props.disablePoll();
    if (e.target.textContent === 'Edit') {
      const parent = e.target.parentNode.parentNode;
      const children = parent.childNodes;

      let values = [];
      let child = parent.lastElementChild;
      for (let i = 0; i < children.length - 1; i++) {
        values.push(children[i].textContent);
      }
      parent.innerHTML = '';
      for (let i = 0; i < values.length; i++) {
        let cell = document.createElement('td');
        let input = document.createElement('input');
        input.setAttribute('type', 'text');
        if (i === 0) input.setAttribute('disabled', true);
        input.setAttribute('value', values[i]);
        cell.appendChild(input);
        parent.appendChild(cell);
      }
      let newButton = document.createElement('button');
      newButton.innerHTML = 'Submit Changes';
      newButton.onclick = this.handleUpdate;
      let cell = document.createElement('td');
      cell.appendChild(newButton);
      parent.appendChild(cell);
    } else if (e.target.innerHTML === 'Submit Changes') {
      const parent = e.target.parentNode.parentNode;
      const children = parent.childNodes;
      let values = [];
      for (let i = 0; i < children.length - 1; i++) {
        values.push(children[i].children[0].value);
      }

      this.props.handleSubmit(values);
    }
  };

  handleAllow = (e) => {
    return true;
  };
  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          
        <TextField
            labelTxt='Item ID'
            value={this.state.ID}
            uniqueName='itemID'
            fieldName='ID'
            type='text'
            required={false}
            text='Enter item ID'
            onChange={this.updateState}
            errorMessage=''
            emptyMessage=''
            validate={this.handleAllow}
          />
        
        <TextField
            labelTxt='Item Name'
            value={this.state.name}
            uniqueName='itemName'
            fieldName='name'
            type='text'
            required={false}
            text='Enter item name'
            onChange={this.updateState}
            errorMessage=''
            emptyMessage=''
            validate={this.handleAllow}
          />
          <TextField
            labelTxt='Item Description'
            value={this.state.description}
            uniqueName='itemDescription'
            fieldName='description'
            type='text'
            required={false}
            text='Enter item description'
            onChange={this.updateState}
            errorMessage=''
            emptyMessage=''
            validate={this.handleAllow}
          />
          <TextField
            labelTxt='Item Price'
            value={this.state.price}
            uniqueName='itemPrice'
            fieldName='price'
            type='text'
            required={false}
            text='Enter item price'
            onChange={this.updateState}
            errorMessage=''
            emptyMessage=''
            validate={this.handleAllow}
          />
        </form>
        <OutputTable
          outputTableHeaderData={this.props.dataArrayHeaders}
          data={this.outputSearchArray(this.props.dataArray)}
          editData={this.handleUpdate.bind(this)}
        />
      </div>
    );
  }
}
