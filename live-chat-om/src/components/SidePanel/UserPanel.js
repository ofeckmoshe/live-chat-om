import React from 'react';
import { Grid, Header, Icon, Dropdown, Image, Modal, Input, Button } from 'semantic-ui-react';
import firebase from '../../firebase';
import AvatarEditor from 'react-avatar-editor';

class UserPanel extends React.Component {

    state = {
        user: this.props.currentUser,
        modal: false,
        previewImage: '',
        croppedImage: '',
        blob: '',
        uploadedImage: '',
        storageRef: firebase.storage().ref(),
        userRef: firebase.auth().currentUser,
        usersRef: firebase.database().ref('users'),
        metadata: {
            contentType: 'image/jpeg'
        }
    };

    openModal = () => {this.setState({ modal: true })};

    closeModal = () => {this.setState({ modal: false })};

    handleChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        if(file){
            reader.readAsDataURL(file);
            reader.addEventListener('load', () => {
                this.setState({ previewImage: reader.result });
            })
        }
    };

    cropImage = () => {
        if(this.AvatarEditor){
            this.AvatarEditor.getImageScaledToCanvas().toBlob(blob => {
                let imageUrl = URL.createObjectURL(blob);
                this.setState({
                    croppedImage: imageUrl,
                    blob
                });
            });
        }
    };

    uploadImage = () => {
    const { storageRef, userRef, blob, metadata } = this.state;

    storageRef
      .child(`avatars/user-${userRef.uid}`)
      .put(blob, metadata)
      .then(snap => {
        snap.ref.getDownloadURL().then(downloadURL => {
          this.setState({ uploadedImage: downloadURL }, () =>
            this.changeAvatar()
          );
        });
      });
    };

    changeAvatar = () => {
        this.state.userRef
            .updateProfile({
                photoURL:this.state.uploadedImage
            })
            .then(() => {
                console.log('PhotoURL updated');
                this.closeModal();
            })
            .catch(err => {
                console.error(err);
            })

            this.state.usersRef
            .child(this.state.user.uid)
            .update({ avatar: this.state.uploadedImage })
            .then(() => {
              console.log("User avatar updated");
            })
            .catch(err => {
              console.error(err);
            });

            this.setState({
                previewImage: '',
                croppedImage: '',
            });
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
            text: <span onClick={this.openModal}>Change Avatar</span>
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

        const { user, modal, previewImage, croppedImage } = this.state;
        const { primaryColor } = this.props;

        return (
            <Grid >
                <Grid.Column>
                    <Grid.Row style={{ padding: '1.2em', margin: 0}}>
                        
                        <Header inverted floated="left" as="h2">
                            <Icon name="code" />
                            <Header.Content>LiveChat</Header.Content>
                        </Header>
                   
                        <Header inverted style={{ padding: '0.25em'}} as="h4">
                            <Dropdown trigger={
                                <span>
                                    <Image src={user.photoURL} spaced="right" avatar />
                                    {user.displayName}
                                </span>
                            } 
                            options={this.dropdownOptions()} />
                        </Header>
                    </Grid.Row>

                    <Modal basic open={modal} onClose={this.closeModal}>
                        <Modal.Header>Change Avatar</Modal.Header>
                        <Modal.Content>
                            <Input 
                                onChange={this.handleChange}
                                fluid
                                type="file"
                                label="New Avatar"
                                name="previewImage"
                            />
                            <Grid centered stackable columns={2}>
                                <Grid.Row centered>
                                    <Grid.Column className="ui center aligned grid">
                                        {previewImage && (
                                            <AvatarEditor 
                                                ref={node => (this.AvatarEditor = node)}
                                                image={previewImage}
                                                width={120}
                                                height={120}
                                                border={50}
                                                scale={1.2}
                                            />
                                        )}
                                    </Grid.Column>
                                            {croppedImage && (
                                                <Image
                                                    style={{ margin: '3.5em auto'}}
                                                    width={100}
                                                    height={100}
                                                    src={croppedImage}
                                                />
                                            )}
                                    <Grid.Column>

                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Modal.Content>
                        <Modal.Actions>
                            <Button color="green" inverted onClick={this.uploadImage}>
                                <Icon name="save" /> Change Avatar
                            </Button>

                            <Button color="green" inverted onClick={this.cropImage}>
                                <Icon name="image" /> Preview
                            </Button>

                            <Button color="red" inverted onClick={this.closeModal}>
                                <Icon name="remove" /> Cancel
                            </Button>
                        </Modal.Actions>
                    </Modal>
                </Grid.Column>
            </Grid>
        );
    };
};

const mapStateToProps = state => ({
    currentUser: state.user.currentUser
});

export default UserPanel;