import React from 'react';
import { Grid, Header, Icon, Dropdown, Image } from 'semantic-ui-react';
import firebase from '../../firebase';

class UserPanel extends React.Component {

    state = {
        user: this.props.currentUser
    };

    dropdownOptions = () => [
        {
            key: 'user',
            text: <span>
                    Signed in as <strong>{this.state.user.displayName}</strong>
                </span>,
            disabled: true
        },
        {
            key: 'avatar',
            text: <span>Change Avatar</span>
        },
        {
            key: 'signout',
            text: <span onClick={this.handleSignout}>Sign Out</span>
        }
    ];

    handleSignout = () => {
        firebase
        .auth()
        .signOut()
        .then(() => console.log('sign out'));
    };

    render() {

        const { user } = this.state;
        const { primaryColor } = this.props;

        return (
            <Grid >
                <Grid.Column>
                    <Grid.Row style={{ padding: '1.2em', margin: 0}}>
                        {/* main Aoo Header */}
                        <Header inverted floated="left" as="h2">
                            <Icon name="code" />
                            <Header.Content>LiveChat</Header.Content>
                        </Header>
                    </Grid.Row>

                    {/* user dropdown */}
                    <Header inverted style={{ padding: '0.25em'}} as="h4">
                        <Dropdown trigger={
                            <span>
                                <Image src={user.photoURL} spaced="right" avatar />
                                {user.displayName}
                            </span>
                        } 
                        options={this.dropdownOptions()} />
                    </Header>
                </Grid.Column>
            </Grid>
        );
    };
};

const mapStateToProps = state => ({
    currentUser: state.user.currentUser
});

export default UserPanel;