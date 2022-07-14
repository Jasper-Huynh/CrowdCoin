/* Our create a campaign page. Use of state and event handlers */

import React, { Component } from 'react';
import Layout from '../../components/Layout';
import { Form, Button, Input, Message } from 'semantic-ui-react';
import factory from '../../ethereum/factory';
import web3 from '../../ethereum/web3';
import { Router } from '../../routes';

class CampaignNew extends Component {
  state = {
    minimumContribution: '',
    errorMessage: '',
    loading: false,
  };

  onSubmit = async (event) => {
    event.preventDefault();

    this.setState({ loading: true });

    try {
      const accounts = await web3.eth.getAccounts();
      await factory.methods
        .createCampaign(this.state.minimumContribution)
        .send({
          from: accounts[0],
        });

      Router.pushRoute('/');
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ loading: false, errorMessage: '' });
  };

  render() {
    return (
      <Layout>
        <h3>Create a Campaign</h3>

        <Form
          onSubmit={this.onSubmit}
          error={!!this.state.errorMessage}
          style={{ marginLeft: '10px' }}
        >
          <Form.Field>
            <label>Minimum Contribution (wei)</label>
            <Input
              label="wei"
              labelPosition="right"
              placeholder="100"
              value={this.state.minimumContribution}
              onChange={(event) =>
                this.setState({ minimumContribution: event.target.value })
              }
            />
          </Form.Field>
          <Message error header="Oops!" content={this.state.errorMessage} />
          <Button loading={this.state.loading} primary type="submit">
            Create!
          </Button>
        </Form>
      </Layout>
    );
  }
}

export default CampaignNew;
