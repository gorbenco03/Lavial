declare module 'react-native-html-to-pdf' {
    interface Options {
      html: string;
      fileName: string;
      directory?: string;
    }
  
    interface Response {
      filePath: string;
    }
  
    function convert(options: Options): Promise<Response>;
    export = { convert };
  }
  