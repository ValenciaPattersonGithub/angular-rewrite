import { TruncateTextPipe } from './truncate-text.pipe';

describe('TruncateTextPipe', () => {
  it('create an instance', () => {
    const pipe = new TruncateTextPipe();
    expect(pipe).toBeTruthy();
  });

  it('should return val if it is undefined, null, or empty string', () => {
    const pipe = new TruncateTextPipe();
    let formattedValue = pipe.transform( undefined , 20);
    expect(formattedValue).toEqual('');

    formattedValue = pipe.transform( null , 20);
    expect(formattedValue).toEqual('');

    formattedValue = pipe.transform( '' , 20);
    expect(formattedValue).toEqual('');
  });

  it('should return val without ellipsis if val length is less than arg', () => {
    const pipe = new TruncateTextPipe();
    const formattedValue = pipe.transform('Adam TheLastNameIsOverTwentyCharacters', 40);
    expect(formattedValue).toEqual('Adam TheLastNameIsOverTwentyCharacters');
  });

  it('should limit returned text based on arg and add ellipsis', () => {
    const pipe = new TruncateTextPipe();
    const formattedValue = pipe.transform('Adam TheLastNameIsOverTwentyCharacters', 20);
    expect(formattedValue).toEqual('Adam TheLastNameIsOv...');
  });

});


