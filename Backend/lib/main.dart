import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // Import for platform channel

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Call Log App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: CallLogPage(),
    );
  }
}

class CallLogPage extends StatefulWidget {
  @override
  _CallLogPageState createState() => _CallLogPageState();
}

class _CallLogPageState extends State<CallLogPage> {
  // Define the platform channel
  static const platform = MethodChannel('com.example/call_logs');
  List<dynamic> _callLogs = [];

  // Method to fetch call logs from Android side
  Future<void> _getCallLogs() async {
    try {
      final List<dynamic> result = await platform.invokeMethod('getCallLogs');
      setState(() {
        _callLogs = result;
      });
    } on PlatformException catch (e) {
      print("Failed to get call logs: '${e.message}'.");
    }
  }

  @override
  void initState() {
    super.initState();
    _getCallLogs(); // Fetch call logs on page load
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Call Logs'),
      ),
      body: ListView.builder(
        itemCount: _callLogs.length,
        itemBuilder: (context, index) {
          final callLog = _callLogs[index];
          return ListTile(
            title: Text('Number: ${callLog['number']}'),
            subtitle: Text('Duration: ${callLog['duration']} seconds'),
            trailing: Text('Date: ${callLog['date']}'),
          );
        },
      ),
    );
  }
}




