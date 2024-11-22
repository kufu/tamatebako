import styled from 'styled-components'

const InvalidStyles = styled.ul`
  Width: 10px;
  margin-top :10px;
  margin-bottom: 0px;
  margin-left: 10PX;
  padding: 0 0 0 0;
  top: 0; bottom: 0;
  font-family: "Arial", sans-serif;
  color: #ffffff;
  background-color: #FFF;
  font-size: 0.55555px;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: auto;
  /* some comments */
  opacity: .5;
  &:after {
    content: '';
    background-color: rgba(0 0 0 / 50%);
  }
  >li:not( :first-child) {
    margin-top: 10px;
  }
  div{}
  [ _target= blank ] {
    display: block;
  }
  display: block

`

const ValidStyles = styled.ul`
  width: 10px;
  margin-top: 10px;
  margin-bottom: 0;
  margin-left: 10px;
  padding: 0;
  top: 0;
  bottom: 0;
  font-family: Arial, sans-serif;
  color: #fff;
  background-color: #fff;
  font-size: 0.5555px;
  flex: 1 1 auto;

  /* some comments */
  opacity: 0.5;
  &::after {
    content: '';
    background-color: rgba(0, 0, 0, 0.5);
  }
  > li:not(:first-child) {
    margin-top: 10px;
  }
  div {
    display: block;
  }
  [_target='blank'] {
    display: block;
  }

  display: block;

  .someClass {
    display: block;
  }
`

// for 'no-descending-specificity' check
const ValidStyles2 = styled.ul`
  > li {
    display: block;
  }
`
