<?php
header("Access-Control-Allow-Origin:*");
header("Access-Control-Allow-Headers: X-Requested-With, Authorrization, content-type, access-control-allow-origin, access-control-allow-methods, access-control-allow-headers");

include "classfile.php";
$validate = new validate; // class for validating values
$class = new sqlops; // class for sql operations
$valjwt = new jwtclass; // class for jwt validation
$post = json_decode(file_get_contents('php://input'),TRUE);
$key = $post['key'];

$code = "";
$cookie = "";

//login
if( $key == "01" ) {
    foreach ($post as $key => $value) {
        if(empty($value)){
            $code = '01'; $message = $key.' cannot be empty';
        }
    }
    //if there are no errors above
    if($code != '01'){
        $tab = 'users';
        $col =  'reg_no, password';
        $where = "WHERE reg_no = '".$post['username']."'";
        $selfetch = $class->select_fetch($col, $tab, $where, '');

        if ( !$selfetch ) {
            $code = '11'; $message = 'Invalid Login';
        } elseif( $post['password'] === $selfetch->password ) {
            $issuer = "http://localhost:4200";
            $audience = "http://localhost:4200/main/home";
            $user = "'".$post['username']."'";
            $varJWT = $valjwt->encrypt_jwt($issuer, $audience, $user);           
            $code = '00'; $message = 'Login Successful'; $cookie = $varJWT;
        } else {
            $code = '11'; $message = 'Invalid Login';
        }
    }
}

//to check if user started clearance already
if ( $key == '02' ) {
    $col = '*';
    $tab = 'clearance';
    $where = " WHERE reg_no = '".$post['user']."' ";
    $where2 = " reg_no = '".$post['user']."' ";
    $tab2 = 'users';

    if ( $class->select_fetch($col, $tab2, $where, '')->cleared == '1' ) {
        $code = '01'; $message = 'You have completed your clearance';
    } else if ( $class->select($col, $tab, $where2) ) {
        $code = '02'; $message = 'Continue clearance';
    } else {
        $code = '03'; $message = 'Start clearance';
    }
}

//to fetch department/faculty payments and levels
if ( $key == '03' ) {
    $class->select_db($post['dues']);
    $tab = 'dues';
    $col = 'DISTINCT payment';
    $col2 = 'DISTINCT level';

    $get = $class->fetch_assoc($col, $tab, '', '');
    $get2 = $class->fetch_assoc($col2, $tab, '', '');

    if ( $get && $get2 ) {
        $code = '00'; $message = $get; $cookie = $get2;
    } else {
        $code = '11'; $message = $get; $cookie = $get2;
    }
}

//to fetch user details
if ( $key == '04' ) {
    $col = '*';
    $tab = 'users';
    $where = " WHERE reg_no = '".$post['user']."' ";

    if ( $get = $class->select_fetch($col, $tab, $where, '') ) {
        $code = '00'; $message = $get;
    } else {
        $code = '11'; $message = $get;
    }
}

//for faculty and dept clearance
if ( $key == '05' ) {
    foreach ( $post as $key => $value ) {
        if ( empty($value) ) {
            $code = '01'; $message = 'All fields are required';
        } else if ( $key == 'pno' ) {
            if ( $validate->validatealnum($value) == false ) {
                $code = '01'; $message = 'The payment number can not contain characters or whitespaces';
            }
        }
    }
    //if no errors above
    if ( $code != '01' ) {
        $class->select_db($post['clearance_for']);

        $col = 'pay_no';
        $tab = 'payments';
        $where = " pay_no = '".$post['pno']."' && reg_no = '".$post['user']."' && pid = '".$post['pid']."' && level = '".$post['level']."' ";

        if ( $class->select($col, $tab, $where) ) {
            $class->select_db('project');
            $tab = 'clearance';
            $cols = 'reg_no, payment, payment_no, pid, level';
            $vals = " '".$post['user']."', '".$post['cleared']."', '".$post['pno']."', '".$post['pid']."', '".$post['level']."' ";
            $where = " reg_no = '".$post['user']."' && payment = '".$post['cleared']."' && payment_no = '".$post['pno']."' && pid = '".$post['pid']."' && level = '".$post['level']."' ";

            if ( $class->select($cols, $tab, $where) ) {
                $code = '02'; $message = 'Payment already cleared';
            } else if ( $class->insert($tab, $cols, $vals) ) {
                //fetch the dues from the dept or faculty
                $class->select_db($post['clearance_for']);
                $col = 'payment, pid, level';
                $tab = 'dues';

                $dues = $class->fetch_assoc($col, $tab, '', '');
                //fetch cleared payments
                $class->select_db('project');
                $col = 'payment, pid, level';
                $tab = 'clearance';
                $where = " WHERE reg_no = '".$post['user']."' ";

                $cleared = $class->fetch_assoc($col, $tab, $where, '');

                $result = array_map('unserialize',
                    array_intersect(
                        array_map('serialize', $dues), array_map('serialize', $cleared)));                
                if( count($result) == count($dues) ) {
                    $post['for'] == 'department' ? $col = 'department_cleared' : $col = 'faculty_cleared';

                    $tab = 'users';
                    $set = " ".$col." = 1 ";
                    $where = " reg_no = '".$post['user']."' ";

                    if ( $class->update($tab, $set, $where) ) {
                        $code = '101'; $message = $post['for'].' clearance completed';
                    } else {
                        $code = '11'; $message = $post['for'].' clearance not completed';
                    }
                } else {
                    $code = '00'; $message = 'Payment successfully cleared';
                }
            } else {
                $code = '11'; $message = 'Clearance not successfull';
            }
        } else {
            $code = '11'; $message = 'Payment number: '.$post['pno'].' not found';
        }
    }
}

//for clearance details
if ( $key == '06' ) {
    $col = '*';
    $tab = 'users';
    $where = " WHERE reg_no = '".$post['user']."' ";

    if ( $get = $class->select_fetch($col, $tab, $where, '') ) {
        $code = '00'; $message = $get;
    } else {
        $code = '11'; $message = $get;
    }
}

//to fetch payments from bursary
if ( $key == '07' ) {
    $class->select_db('bursary');
    $tab = 'dues';
    $col = '*';

    $get = $class->fetch_assoc($col, $tab, '', '');

    $class->select_db('others');
    $get2 = $class->fetch_assoc($col, $tab, '', '');

    if ( $get && $get2 ) {
        $code = '00'; $message = $get; $cookie = $get2;
    } else {
        $code = '11'; $message = $get; $cookie = $get2;
    }
}

//for bursary clearance
if ( $key == '08' ) {
    $class->select_db('bursary');

    $col = 'pay_no';
    $tab = 'payments';
    $where = " pay_no = '".$post['pno']."' && reg_no = '".$post['user']."' && pid = '".$post['pid']."' && session = '".$post['session']."' ";

    if ( $class->select($col, $tab, $where) ) {
        $class->select_db('project');
        $tab = 'clearance';
        $cols = 'reg_no, payment, payment_no, pid, level';
        $vals = " '".$post['user']."', '".$post['cleared']."', '".$post['pno']."', '".$post['pid']."', '".$post['session']."' ";
        $where = " reg_no = '".$post['user']."' && payment = '".$post['cleared']."' && payment_no = '".$post['pno']."' && pid = '".$post['pid']."' && level = '".$post['session']."' ";

        if ( $class->select($cols, $tab, $where) ) {
            $code = '02'; $message = 'Payment already cleared';
        } else if ( $class->insert($tab, $cols, $vals) ) {
            //fetch the dues from bursary
            $class->select_db('bursary');
            $col = 'payment, pid';
            $tab = 'dues';

            $dues = $class->fetch_assoc($col, $tab, '', '');
            //fetch cleared payments
            $class->select_db('project');
            $col = 'payment, pid';
            $tab = 'clearance';
            $where = " WHERE reg_no = '".$post['user']."' ";

            $cleared = $class->fetch_assoc($col, $tab, $where, '');

            $result = array_map('unserialize',
                array_intersect(
                    array_map('serialize', $dues), array_map('serialize', $cleared)));                
            if( count($result) == count($dues) ) {

                $tab = 'users';
                $set = " bursary_cleared = 1 ";
                $where = " reg_no = '".$post['user']."' ";

                if ( $class->update($tab, $set, $where) ) {
                    $code = '101'; $message = 'Bursary clearance completed';
                } else {
                    $code = '11'; $message = 'Bursary clearance not completed';
                }
            } else {
                $code = '00'; $message = 'Payment successfully cleared';
            }
        } else {
            $code = '11'; $message = 'Clearance not successfull';
        }
    } else {
        $code = '11'; $message = 'Payment number: '.$post['pno'].' not found';
    }
}

//for other clearance
if ( $key == '09' ) {
    $class->select_db('others');

    $col = 'pay_no';
    $tab = 'payments';
    $where = " pay_no = '".$post['pno']."' && reg_no = '".$post['user']."' && pid = '".$post['pid']."' ";

    if ( $class->select($col, $tab, $where) ) {
        $class->select_db('project');
        $tab = 'clearance';
        $cols = 'reg_no, payment, payment_no, pid, level';
        $vals = " '".$post['user']."', '".$post['cleared']."', '".$post['pno']."', '".$post['pid']."', '' ";
        $where = " reg_no = '".$post['user']."' && payment = '".$post['cleared']."' && payment_no = '".$post['pno']."' && pid = '".$post['pid']."' ";

        if ( $class->select($cols, $tab, $where) ) {
            $code = '02'; $message = 'Payment already cleared';
        } else if ( $class->insert($tab, $cols, $vals) ) {
            //fetch the dues from others db
            $class->select_db('others');
            $col = 'payment, pid';
            $tab = 'dues';

            $dues = $class->fetch_assoc($col, $tab, '', '');
            //fetch cleared payments
            $class->select_db('project');
            $col = 'payment, pid';
            $tab = 'clearance';
            $where = " WHERE reg_no = '".$post['user']."' ";

            $cleared = $class->fetch_assoc($col, $tab, $where, '');

            $result = array_map('unserialize',
                array_intersect(
                    array_map('serialize', $dues), array_map('serialize', $cleared)));                
            if ( count($result) == count($dues) ) {

                $tab = 'users';
                $set = " others_cleared = 1, cleared = 1 ";
                $where = " reg_no = '".$post['user']."' ";

                if ( $class->update($tab, $set, $where) ) {
                    $code = '101'; $message = 'Clearance completed';
                } else {
                    $code = '11'; $message = 'Clearance not completed';
                }
            } else {
                $code = '00'; $message = 'Payment successfully cleared';
            }
        } else {
            $code = '11'; $message = 'Clearance not successfull';
        }
    } else {
        $code = '11'; $message = 'Payment number: '.$post['pno'].' not found';
    }
}

//for clearance table
if ( $key == '10' ) {
    //fetch dues from user's dept
    $class->select_db($post['department']);

    $col = 'payment, pid, level';
    $tab = 'dues';
    $tab2 = 'clearance';
    $department = $class->fetch_assoc($col, $tab, '', '');

    //fetch dues from user's faculty
    $class->select_db($post['faculty']);
    $faculty = $class->fetch_assoc($col, $tab, '', '');

    //fetch dues from bursary;
    $class->select_db('bursary');
    $bursary_col = 'Payment, pid';
    $bursary = $class->fetch_assoc($bursary_col, $tab, '', '');

    //fetch dues from other payments
    $class->select_db('others');
    $others = $class->fetch_assoc($bursary_col, $tab, '', '');

    $class->select_db('project');
    $cleared = $class->fetch_assoc($col, $tab2, '', '');
    $bursary_cleared = $class->fetch_assoc($bursary_col, $tab2, '', '');

    $message = [];

    if ( $department && $cleared ) {
        foreach ($department as $key => $value) {
            if ( in_array($value, $cleared) ) { //if payment has been cleared
                $department[$key]['status'] = 'cleared'; //push in status as an object
            } else {
                $department[$key]['status'] = 'not cleared';
            }
        }
        array_push($message, $department);
    } else {
        array_push($message, '');
    }

    if ( $faculty && $cleared ) {
        foreach ($faculty as $key => $value) {
            if ( in_array($value, $cleared) ) { //if payment has been cleared
                $faculty[$key]['status'] = 'cleared'; //push in status as an object
            } else {
                $faculty[$key]['status'] = 'not cleared';
            }
        }
        array_push($message, $faculty);
    } else {
        array_push($message, '');
    }

    if ( $bursary && $bursary_cleared ) {
        foreach ($bursary as $key => $value) {
            if ( in_array($value, $bursary_cleared) ) { //if payment has been cleared
                $bursary[$key]['status'] = 'cleared'; //push in status as an object
            } else {
                $bursary[$key]['status'] = 'not cleared';
            }
        }
        array_push($message, $bursary);
    } else {
        array_push($message, '');
    }
    
    if ( $others && $bursary_cleared ) {
        foreach ($others as $key => $value) {
            if ( in_array($value, $bursary_cleared) ) { //if payment has been cleared
                $others[$key]['status'] = 'cleared'; //push in status as an object
            } else {
                $others[$key]['status'] = 'not cleared';
            }
        }
        array_push($message, $others);
    } else {
        array_push($message, '');
    }

    if ( $message ) {
        $code = '00'; $message = $message;
    } else {
        $code = '11'; $message = $message;
    }
}

//fetch results
if ( $key == '11' ) {
    $class->select_db($post['department']);

    $col = '*'; 
    $tab = 'results';
    $where = " WHERE reg_no = '".$post['user']."' ";

    if ( $get = $class->fetch_assoc($col, $tab, $where, '') ) {
        $code = '00'; $message = $get;
    } else {
        $code = '11'; $message = $get;
    }
}
echo json_encode(['code'=>$code, 'message'=>$message, 'cookie'=>$cookie]);
?>