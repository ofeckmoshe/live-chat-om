import React from 'react';
import firebase from '../../firebase';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import md5 from 'md5';

class Regiser extends React.Component {

	state ={
		username: '',
		email: '',
		password: '',
		passwordConfirmation: '',
		errors: [],
		loading: false,
		userRef: firebase.database().ref('users')
	};

	isFormValid = () => {
		let errors = [];
		let error;
		if(this.isFormEmpty(this.state)){
			error = { message: 'You must fill all fields' };
			this.setState({ errors: errors.concat(error) });
			return false;
		}else if(!this.isPasswordValid(this.state)){
			error = { message: 'Password is invalid' };
			this.setState({ errors: errors.concat(error) });
			return false;
		}else{
			return true;
		};
	};

	isFormEmpty = ({ username, email, password, passwordConfirmation }) => {
		return !username.length || !email.length || !password.length || !passwordConfirmation.length;
	};

	isPasswordValid = ({ password, passwordConfirmation }) => {
		if(password.length < 6 || passwordConfirmation.length < 6){
			return false;
		}else if (password !== passwordConfirmation){
			return false;
		}else{
			return true;
		}
	};

	displayErrors = errors => errors.map((error,i) => <p key={i}>{error.message}</p>);

	handleChange = event => {
		this.setState({ [event.target.name]: event.target.value})
	};

	handleSubmit = event => {
		event.preventDefault();
		if(this.isFormValid()){
		this.setState({ errors: [], loading: true });
		firebase
			.auth()
			.createUserWithEmailAndPassword(this.state.email, this.state.password)
			.then(createdUser => {
				console.log('createdUser', createdUser);
				createdUser.user.updateProfile({
					displayName: this.state.username,
					photoURL: `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
				})
				.then(() => {
					this.saveUser(createdUser).then(() => {
						console.log("user saved");
					})
				})
				.catch(err => {
					console.log(err)
					this.setState({ errors: this.state.errors.concat(err)  })
				})
			})
			.catch(err => {
				console.log('error', err);
				this.setState({ errors: this.state.errors.concat(err), loading: false });
			});
		}
	};

	saveUser = (createdUser) => {
		return this.state.userRef.child(createdUser.user.uid).set({
			name: createdUser.user.displayName,
			avatar: createdUser.user.photoURL
		})
	};

	handleInputError = (errors, inputName) => {
		errors.some(error => 
			error.message.toLowerCase().includes(inputName)
		) 
		? 'error' 
		: ''
	};

    render() {

		const { username, email, password, passwordConfirmation, errors, loading } = this.state;

        return (
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{maxWidth: 450 }}>
                    <Header as="h1" icon color="orange" textAlign="center">
                        <Icon name="puzzle piece" color="orange"/>
                        Regiser for Live Chat
                    </Header>
                    <Form onSubmit={this.handleSubmit} size="large">
                        <Segment stacked >
                            <Form.Input fluid 
                                        name="username" 
                                        icon="user"
                                        iconPosition="left"
                                        placeholder="UserName"
										type="text"
										value={username}
                                        onChange={this.handleChange}
                            />

							<Form.Input fluid 
                                        name="email" 
                                        icon="mail"
                                        iconPosition="left"
                                        placeholder="Email Address"
										type="email"
										value={email}
										className={this.handleInputError(errors, "email")}
                                        onChange={this.handleChange}
                            />

							<Form.Input fluid 
                                        name="password" 
                                        icon="lock"
                                        iconPosition="left"
                                        placeholder="Password"
										type="password"
										value={password}
										className={this.handleInputError(errors, "password")}
                                        onChange={this.handleChange}
                            />

							<Form.Input fluid 
                                        name="passwordConfirmation" 
                                        icon="repeat"
                                        iconPosition="left"
                                        placeholder="Password confirmation"
										type="password"
										value={passwordConfirmation}
										className={this.handleInputError(errors, "password")}
                                        onChange={this.handleChange}
                            />

							<Button disabled={loading} 
									className={loading ? 'loading' : ''} 
									color="orange" 
									fluid size="large"
							>
								Submit
							</Button>
                        </Segment>
                    </Form>
					{errors.length > 0 && (
						<Message error>
							<h3>Error</h3>
							{this.displayErrors(errors)}
						</Message>
					)}
					<Message>Already a user?<Link to="/login">Login</Link></Message>
                </Grid.Column>
            </Grid>
        );
    };
};

export default Regiser;